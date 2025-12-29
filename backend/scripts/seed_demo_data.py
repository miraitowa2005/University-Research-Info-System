#!/usr/bin/env python3
import asyncio
import os
import sys
import json
from typing import Dict, Any, List
import aiomysql

ROOT_DIR = os.path.dirname(os.path.dirname(__file__))
sys.path.insert(0, ROOT_DIR)
sys.path.insert(0, os.path.join(ROOT_DIR, "app"))
from app.core.config import settings
from app.core.security import get_password_hash

async def seed():
    conf = {
        "host": settings.DB_HOST,
        "port": settings.DB_PORT,
        "user": settings.DB_USER,
        "password": settings.DB_PASS,
        "db": settings.DB_NAME,
        "charset": "utf8mb4",
        "autocommit": True,
    }
    pool = await aiomysql.create_pool(**conf)
    try:
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("SELECT id, code FROM departments")
                dept_rows = await cur.fetchall()
                codes = {r[1]: r[0] for r in dept_rows}
                if "MATH" not in codes:
                    await cur.execute("INSERT INTO departments (code,name) VALUES (%s,%s)", ("MATH","数学学院"))
                    codes["MATH"] = cur.lastrowid
                await cur.execute("SELECT id, name FROM research_subtypes")
                sub_rows = await cur.fetchall()
                subs = {r[1]: r[0] for r in sub_rows}
                for name in ["纵向科研项目","横向科研项目","学术论文","出版著作","专利成果","科研获奖"]:
                    if name not in subs:
                        await cur.execute("INSERT INTO research_subtypes (name) VALUES (%s)", (name,))
                        subs[name] = cur.lastrowid
                # Extra departments and aliases (20)
                await cur.execute("SELECT id, code FROM departments")
                dept_rows = await cur.fetchall()
                codes = {r[1]: r[0] for r in dept_rows}
                base_count = 0
                for i in range(1, 21):
                    code = f"DPT{i:02d}"
                    name = f"示例学院{i:02d}"
                    if code not in codes:
                        await cur.execute("INSERT INTO departments (code,name) VALUES (%s,%s)", (code, name))
                        codes[code] = cur.lastrowid
                    # ensure alias
                    alias = f"{name}别名"
                    await cur.execute("SELECT id FROM department_aliases WHERE alias=%s", (alias,))
                    if not await cur.fetchone():
                        await cur.execute("INSERT INTO department_aliases (alias,code) VALUES (%s,%s)", (alias, code))
                users_data = [
                    {"full_name":"System Admin","email":"admin@local","role":"sys_admin","dept_code":"CS"},
                    {"full_name":"Research Manager","email":"manager@local","role":"research_admin","dept_code":"CS"},
                    {"full_name":"Physics Manager","email":"phy_manager@local","role":"research_admin","dept_code":"PHY"},
                    {"full_name":"Alice Zhang","email":"alice@local","role":"teacher","dept_code":"CS"},
                    {"full_name":"Bob Li","email":"bob@local","role":"teacher","dept_code":"PHY"},
                    {"full_name":"Chen Wu","email":"chen@local","role":"teacher","dept_code":"MATH"},
                ]
                users_ids: Dict[str,int] = {}
                for u in users_data:
                    await cur.execute("SELECT id FROM users WHERE email=%s", (u["email"],))
                    row = await cur.fetchone()
                    if row:
                        users_ids[u["email"]] = int(row[0])
                        continue
                    hpw = get_password_hash("Passw0rd!")
                    dept_id = codes.get(u["dept_code"])
                    await cur.execute(
                        "INSERT INTO users (full_name,email,hashed_password,is_active,is_superuser,role,dept_id,department,department_code,phone,profile_public) VALUES (%s,%s,%s,1,%s,%s,%s,%s,%s,%s,%s)",
                        (
                            u["full_name"], u["email"], hpw,
                            1 if u["role"]=="sys_admin" else 0,
                            u["role"],
                            dept_id,
                            {"CS":"计算机学院","PHY":"物理学院","MATH":"数学学院"}.get(u["dept_code"]),
                            u["dept_code"],
                            "13800000000",
                            0
                        )
                    )
                    users_ids[u["email"]] = cur.lastrowid
                # Add 10 more users
                dept_codes_list = list(codes.keys())
                for i in range(1, 11):
                    email = f"user{i}@local"
                    await cur.execute("SELECT id FROM users WHERE email=%s", (email,))
                    if await cur.fetchone():
                        continue
                    full_name = f"Demo User {i}"
                    role = "teacher"
                    hpw = get_password_hash("Passw0rd!")
                    pick = dept_codes_list[i % len(dept_codes_list)]
                    dept_id = codes.get(pick)
                    await cur.execute(
                        "INSERT INTO users (full_name,email,hashed_password,is_active,is_superuser,role,dept_id,department,department_code,phone,profile_public) VALUES (%s,%s,%s,1,%s,%s,%s,%s,%s,%s,%s)",
                        (full_name, email, hpw, 0, role, dept_id, f"{pick}学院", pick, "13900000000", 0)
                    )
                    users_ids[email] = cur.lastrowid
                # gather teacher user ids
                await cur.execute("SELECT id FROM users WHERE role='teacher'")
                teacher_rows = await cur.fetchall()
                teacher_ids = [int(r[0]) for r in teacher_rows] or list(users_ids.values())
                await cur.execute("SELECT id,name FROM roles")
                role_rows = await cur.fetchall()
                role_ids = {r[1]: r[0] for r in role_rows}
                perms = [
                    ("system.health.view","sys_admin"),
                    ("system.users.manage","sys_admin"),
                    ("system.rbac.manage","sys_admin"),
                    ("research.audit","research_admin"),
                    ("research.notice.publish","research_admin"),
                    ("research.stats.view","research_admin"),
                    ("research.data.export","teacher"),
                ]
                for code, rname in perms:
                    rid = role_ids.get(rname) or role_ids.get({"sys_admin":"系统管理员","research_admin":"科研管理员","teacher":"教师"}.get(rname,""))
                    if rid:
                        await cur.execute("SELECT id FROM role_permissions WHERE role_id=%s AND code=%s", (rid,code))
                        if not await cur.fetchone():
                            await cur.execute("INSERT INTO role_permissions (role_id,code) VALUES (%s,%s)", (rid,code))
                # Bulk generate ext tables with linked research_items
                def pick_owner(idx: int) -> int:
                    return teacher_ids[idx % len(teacher_ids)]
                # 100 vertical projects
                for i in range(100):
                    uid = pick_owner(i)
                    sid = subs.get("纵向科研项目") or subs.get("纵向项目")
                    cj = {"funding": float(100 + i), "source": "国家自然科学基金"}
                    title = f"纵向项目-{i:03d}"
                    ch = f"hash_v_{uid}_{i}"
                    await cur.execute("SELECT id FROM research_items WHERE user_id=%s AND subtype_id=%s AND content_hash=%s", (uid, sid, ch))
                    if await cur.fetchone():
                        continue
                    await cur.execute(
                        "INSERT INTO research_items (title,user_id,subtype_id,content_hash,content_json,status,file_url) VALUES (%s,%s,%s,%s,%s,%s,%s)",
                        (title, uid, sid, ch, json.dumps(cj, ensure_ascii=False), "approved" if i%3==0 else "pending", None)
                    )
                    rid = cur.lastrowid
                    await cur.execute("INSERT INTO ext_vertical_projects (id,project_source,approval_number,total_funding,project_level,start_date,end_date) VALUES (%s,%s,%s,%s,%s,%s,%s)",
                        (rid,"国家自然科学基金",f"NSFC-{2024+i}", float(100+i), "省部级", "2024-03-01","2026-03-01"))
                # 100 horizontal projects
                for i in range(100):
                    uid = pick_owner(i+100)
                    sid = subs.get("横向科研项目") or subs.get("横向项目")
                    cj = {"funding": float(80 + i), "source": "校企合作"}
                    title = f"横向项目-{i:03d}"
                    ch = f"hash_h_{uid}_{i}"
                    await cur.execute("SELECT id FROM research_items WHERE user_id=%s AND subtype_id=%s AND content_hash=%s", (uid, sid, ch))
                    if await cur.fetchone():
                        continue
                    await cur.execute(
                        "INSERT INTO research_items (title,user_id,subtype_id,content_hash,content_json,status,file_url) VALUES (%s,%s,%s,%s,%s,%s,%s)",
                        (title, uid, sid, ch, json.dumps(cj, ensure_ascii=False), "approved" if i%4==0 else "pending", None)
                    )
                    rid = cur.lastrowid
                    await cur.execute("INSERT INTO ext_horizontal_projects (id,partner_name,contract_number,total_funding,start_date,end_date) VALUES (%s,%s,%s,%s,%s,%s)",
                        (rid,"某科技有限公司",f"HT-{2000+i}", float(80+i), "2024-01-10","2025-12-31"))
                # 100 papers
                for i in range(100):
                    uid = pick_owner(i+200)
                    sid = subs.get("学术论文")
                    cj = {"impact_factor": float((i%10)/2.0+1.0), "journal_name": "Journal of Research"}
                    title = f"学术论文-{i:03d}"
                    ch = f"hash_p_{uid}_{i}"
                    await cur.execute("SELECT id FROM research_items WHERE user_id=%s AND subtype_id=%s AND content_hash=%s", (uid, sid, ch))
                    if await cur.fetchone():
                        continue
                    await cur.execute(
                        "INSERT INTO research_items (title,user_id,subtype_id,content_hash,content_json,status,file_url) VALUES (%s,%s,%s,%s,%s,%s,%s)",
                        (title, uid, sid, ch, json.dumps(cj, ensure_ascii=False), "approved" if i%5==0 else "pending", None)
                    )
                    rid = cur.lastrowid
                    await cur.execute("INSERT INTO ext_academic_papers (id,journal_name,impact_factor,publish_date,volume_issue,is_sci) VALUES (%s,%s,%s,%s,%s,%s)",
                        (rid,"Journal of Research", cj["impact_factor"], "2024-05-20","12(3)",1))
                # 100 patents
                for i in range(100):
                    uid = pick_owner(i+300)
                    sid = subs.get("专利成果") or subs.get("专利")
                    title = f"专利成果-{i:03d}"
                    ch = f"hash_pt_{uid}_{i}"
                    await cur.execute("SELECT id FROM research_items WHERE user_id=%s AND subtype_id=%s AND content_hash=%s", (uid, sid, ch))
                    if await cur.fetchone():
                        continue
                    await cur.execute(
                        "INSERT INTO research_items (title,user_id,subtype_id,content_hash,content_json,status,file_url) VALUES (%s,%s,%s,%s,%s,%s,%s)",
                        (title, uid, sid, ch, json.dumps({}, ensure_ascii=False), "pending", None)
                    )
                    rid = cur.lastrowid
                    await cur.execute("INSERT INTO ext_patents (id,patent_number,grant_date,inventor,patent_type,assignee) VALUES (%s,%s,%s,%s,%s,%s)",
                        (rid, f"CN{100000+i}", "2024-09-01", "发明人X", "发明专利", "某高校"))
                # 100 books
                for i in range(100):
                    uid = pick_owner(i+400)
                    sid = subs.get("出版著作")
                    title = f"出版著作-{i:03d}"
                    ch = f"hash_bk_{uid}_{i}"
                    await cur.execute("SELECT id FROM research_items WHERE user_id=%s AND subtype_id=%s AND content_hash=%s", (uid, sid, ch))
                    if await cur.fetchone():
                        continue
                    await cur.execute(
                        "INSERT INTO research_items (title,user_id,subtype_id,content_hash,content_json,status,file_url) VALUES (%s,%s,%s,%s,%s,%s,%s)",
                        (title, uid, sid, ch, json.dumps({}, ensure_ascii=False), "draft" if i%7==0 else "approved", None)
                    )
                    rid = cur.lastrowid
                    await cur.execute("INSERT INTO ext_academic_books (id,publisher,isbn,publish_date,pages) VALUES (%s,%s,%s,%s,%s)",
                        (rid,"高等教育出版社", f"978-7-{300000+i}", "2024-11-01", 320+i%100))
                # 100 awards
                for i in range(100):
                    uid = pick_owner(i+500)
                    sid = subs.get("科研获奖")
                    title = f"科研获奖-{i:03d}"
                    ch = f"hash_aw_{uid}_{i}"
                    await cur.execute("SELECT id FROM research_items WHERE user_id=%s AND subtype_id=%s AND content_hash=%s", (uid, sid, ch))
                    if await cur.fetchone():
                        continue
                    await cur.execute(
                        "INSERT INTO research_items (title,user_id,subtype_id,content_hash,content_json,status,file_url) VALUES (%s,%s,%s,%s,%s,%s,%s)",
                        (title, uid, sid, ch, json.dumps({}, ensure_ascii=False), "approved", None)
                    )
                    rid = cur.lastrowid
                    await cur.execute("INSERT INTO ext_awards (id,awarding_body,award_level,award_year,certificate_no) VALUES (%s,%s,%s,%s,%s)",
                        (rid,"省科技厅", "二等奖" if i%3==0 else "三等奖", 2024, f"CERT-{rid}"))
                # 50 additional research items across subtypes
                subtype_cycle = ["纵向科研项目","横向科研项目","学术论文","专利成果","出版著作","科研获奖"]
                for i in range(50):
                    uid = pick_owner(i+600)
                    sname = subtype_cycle[i % len(subtype_cycle)]
                    sid = subs.get(sname) or subs.get("纵向项目") or subs.get("横向项目")
                    title = f"附加条目-{i:03d}"
                    cj = {"amount": float(50+i)} if ("纵向" in sname or "横向" in sname) else {}
                    ch = f"hash_extra_{uid}_{i}"
                    await cur.execute("SELECT id FROM research_items WHERE user_id=%s AND subtype_id=%s AND content_hash=%s", (uid, sid, ch))
                    if await cur.fetchone():
                        continue
                    await cur.execute(
                        "INSERT INTO research_items (title,user_id,subtype_id,content_hash,content_json,status,file_url) VALUES (%s,%s,%s,%s,%s,%s,%s)",
                        (title, uid, sid, ch, json.dumps(cj, ensure_ascii=False), "pending" if i%2==0 else "approved", None)
                    )
                notices = [
                    ("科研项目申报通知","请按时提交项目材料","research_admin","CS"),
                    ("论文版面费报销流程","请走财务系统报销","teacher","PHY"),
                ]
                for title, content, role, dcode in notices:
                    await cur.execute("INSERT INTO notices (title,content,target_role,target_dept_id,publisher) VALUES (%s,%s,%s,%s,%s)",
                        (title, content, role, codes.get(dcode), "系统"))
                await cur.execute("SELECT id FROM notices")
                nrows = await cur.fetchall()
                if nrows:
                    nid = nrows[0][0]
                    for email in ["alice@local","bob@local","manager@local"]:
                        await cur.execute("INSERT INTO notice_recipients (notice_id,user_id,is_read) VALUES (%s,%s,0)",
                            (nid, users_ids[email]))
                templates = [
                    ("纵向项目审核表","字段：项目来源/经费/负责人","1"),
                    ("横向项目审核表","字段：合同编号/合作单位/经费","1"),
                ]
                for t in templates:
                    await cur.execute("INSERT INTO review_templates (title,content,is_shared) VALUES (%s,%s,%s)", t)
                exps = [
                    ("alice@local","education","2015-09-01","2019-07-01","本科","计算机学院","主修软件工程",1),
                    ("alice@local","work","2019-09-01",None,"助理研究员","计算机学院","参与纵向课题",2),
                    ("bob@local","work","2018-01-01",None,"讲师","物理学院","发表SCI论文",1),
                ]
                for email,t,start,end,title,inst,desc,order in exps:
                    await cur.execute(
                        "INSERT INTO user_experiences (user_id,type,start_date,end_date,title,institution,description,order_index) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",
                        (users_ids[email], t, start, end, title, inst, desc, order)
                    )
    finally:
        pool.close()
        await pool.wait_closed()

if __name__ == "__main__":
    asyncio.run(seed())
    # quick verify
    async def verify():
        conf = {
            "host": settings.DB_HOST,
            "port": settings.DB_PORT,
            "user": settings.DB_USER,
            "password": settings.DB_PASS,
            "db": settings.DB_NAME,
            "charset": "utf8mb4",
        }
        pool = await aiomysql.create_pool(**conf)
        try:
            async with pool.acquire() as conn:
                async with conn.cursor() as cur:
                    tables = [
                        "departments","department_aliases","users","research_items",
                        "ext_vertical_projects","ext_horizontal_projects","ext_academic_papers",
                        "ext_patents","ext_academic_books","ext_awards"
                    ]
                    for t in tables:
                        await cur.execute(f"SELECT COUNT(*) FROM {t}")
                        c = (await cur.fetchone())[0]
                        print(f"[COUNT] {t}: {c}")
        finally:
            pool.close()
            await pool.wait_closed()
    asyncio.run(verify())
