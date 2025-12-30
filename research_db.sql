/*
 Navicat Premium Dump SQL

 Source Server         : localhost
 Source Server Type    : MySQL
 Source Server Version : 80041 (8.0.41)
 Source Host           : localhost:3306
 Source Schema         : research_db

 Target Server Type    : MySQL
 Target Server Version : 80041 (8.0.41)
 File Encoding         : 65001

 Date: 30/12/2025 14:14:48
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for audit_logs
-- ----------------------------
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NULL DEFAULT NULL,
  `action` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `target_id` int NULL DEFAULT NULL,
  `old_value` json NULL,
  `new_value` json NULL,
  `ip` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` datetime NULL DEFAULT (now()),
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `user_id`(`user_id` ASC) USING BTREE,
  INDEX `ix_audit_logs_id`(`id` ASC) USING BTREE,
  CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 30 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of audit_logs
-- ----------------------------
INSERT INTO `audit_logs` VALUES (1, 17, '创建科研项目', 'research_item', 660, 'null', '{\"title\": \"基于计算机视觉的工业缺陷检测算法研发\", \"status\": \"pending\", \"file_url\": null, \"subtype_id\": 2, \"content_json\": {\"end_date\": \"2025-10-25\", \"start_date\": \"2025-12-20\", \"partner_name\": \"深圳市大疆创新科技有限公司\", \"total_funding\": 120, \"contract_number\": \"HT-2024-DJI-003\"}, \"team_members\": [\"柴泽同\"]}', '127.0.0.1', '2025-12-30 09:01:38');
INSERT INTO `audit_logs` VALUES (2, 18, '更新项目状态', 'research_item', 660, '{\"status\": \"pending\"}', '{\"status\": \"rejected\", \"remarks\": \"材料缺失。\"}', '127.0.0.1', '2025-12-30 09:05:01');
INSERT INTO `audit_logs` VALUES (3, 22, '创建科研项目', 'research_item', 661, 'null', '{\"title\": \"基于计算机视觉的工业缺陷检测算法研发\", \"status\": \"pending\", \"file_url\": null, \"subtype_id\": 2, \"content_json\": {\"end_date\": \"2025-12-24\", \"start_date\": \"2025-12-18\", \"partner_name\": \"深圳市大疆创新科技有限公司\", \"total_funding\": 120, \"contract_number\": \"HT-2024-DJI-003\"}, \"team_members\": [\"柴泽同\", \"薛汉林\"]}', '127.0.0.1', '2025-12-30 09:31:57');
INSERT INTO `audit_logs` VALUES (4, 23, '更新项目状态', 'research_item', 661, '{\"status\": \"pending\"}', '{\"status\": \"approved\", \"remarks\": null}', '127.0.0.1', '2025-12-30 09:32:54');
INSERT INTO `audit_logs` VALUES (5, 25, '创建科研项目', 'research_item', 662, 'null', '{\"title\": \"工业缺陷检测算法研发\", \"status\": \"pending\", \"file_url\": null, \"subtype_id\": 2, \"content_json\": {\"end_date\": \"2025-12-30\", \"start_date\": \"2025-10-10\", \"partner_name\": \"深圳市大疆创新科技有限公司\", \"total_funding\": 222, \"contract_number\": \"HT-2024-DJI-003\"}, \"team_members\": [\"李行健\"]}', '127.0.0.1', '2025-12-30 09:45:24');
INSERT INTO `audit_logs` VALUES (6, 24, '更新项目状态', 'research_item', 662, '{\"status\": \"pending\"}', '{\"status\": \"approved\", \"remarks\": null}', '127.0.0.1', '2025-12-30 09:45:54');
INSERT INTO `audit_logs` VALUES (7, 26, '创建科研项目', 'research_item', 663, 'null', '{\"title\": \"A Novel Attention Mechanism for Multimodal Sentiment Analysis\", \"status\": \"pending\", \"file_url\": null, \"subtype_id\": 1, \"content_json\": {\"is_sci\": true, \"journal_name\": \"A Novel Attention Mechanism for Multimodal Sentiment Analysis\", \"publish_date\": \"2025-12-31\", \"volume_issue\": \"Vol. 46, No. 5, pp. 3421-3435\", \"impact_factor\": 24.31}, \"team_members\": [\"柴泽同\"]}', '127.0.0.1', '2025-12-30 09:54:06');
INSERT INTO `audit_logs` VALUES (8, 27, '更新项目状态', 'research_item', 663, '{\"status\": \"pending\"}', '{\"status\": \"rejected\", \"remarks\": \"时间出错\\n\"}', '127.0.0.1', '2025-12-30 09:54:48');
INSERT INTO `audit_logs` VALUES (9, 26, '创建科研项目', 'research_item', 664, 'null', '{\"title\": \"A Novel Attention Mechanism\", \"status\": \"pending\", \"file_url\": null, \"subtype_id\": 1, \"content_json\": {\"is_sci\": true, \"journal_name\": \"IEEE TPAMI\", \"publish_date\": \"2025-12-30\", \"volume_issue\": \"Vol. 46, No. 5, pp. 3421-3435\", \"impact_factor\": 32}, \"team_members\": [\"曲丽蓉\"]}', '127.0.0.1', '2025-12-30 10:00:14');
INSERT INTO `audit_logs` VALUES (10, 27, '更新项目状态', 'research_item', 664, '{\"status\": \"pending\"}', '{\"status\": \"approved\", \"remarks\": null}', '127.0.0.1', '2025-12-30 10:09:13');
INSERT INTO `audit_logs` VALUES (11, 17, '创建科研项目', 'research_item', 665, 'null', '{\"title\": \"一种基于区块链的高校科研数据防篡改存证方法\", \"status\": \"pending\", \"file_url\": null, \"subtype_id\": 5, \"content_json\": {\"assignee\": \"\", \"inventor\": \"柴泽同\", \"grant_date\": \"2025-12-30\", \"patent_type\": \"发明专利\", \"patent_number\": \"ZL202310567890.X\"}, \"team_members\": [\"柴泽同\"]}', '127.0.0.1', '2025-12-30 10:11:02');
INSERT INTO `audit_logs` VALUES (12, 17, '创建科研项目', 'research_item', 666, 'null', '{\"title\": \"复杂网络环境下的多模态数据融合关键技术及应用\", \"status\": \"pending\", \"file_url\": null, \"subtype_id\": 6, \"content_json\": {\"award_year\": 2025, \"award_level\": \"省部级一等奖\", \"awarding_body\": \"教育部\", \"certificate_no\": \"2023-J-201-1-01\"}, \"team_members\": [\"柴泽同\"]}', '127.0.0.1', '2025-12-30 10:11:48');
INSERT INTO `audit_logs` VALUES (13, 17, '创建科研项目', 'research_item', 667, 'null', '{\"title\": \"新能源汽车电池热管理系统仿真与优化服务\", \"status\": \"pending\", \"file_url\": null, \"subtype_id\": 2, \"content_json\": {\"end_date\": \"2025-12-30\", \"start_date\": \"2025-12-30\", \"partner_name\": \"比亚迪汽车工业有限公司\", \"total_funding\": 200, \"contract_number\": \"JS-2024-BYD-009\"}, \"team_members\": [\"柴泽同\"]}', '127.0.0.1', '2025-12-30 10:22:32');
INSERT INTO `audit_logs` VALUES (14, 17, '创建科研项目', 'research_item', 668, 'null', '{\"title\": \"基于多源遥感数据的城市热岛效应演变机制研究\", \"status\": \"pending\", \"file_url\": null, \"subtype_id\": 1, \"content_json\": {\"end_date\": \"2025-12-30\", \"start_date\": \"2025-12-01\", \"project_level\": \"省部级\", \"total_funding\": 10, \"project_source\": \"省级自然科学基金\", \"approval_number\": \"2024ZR05123\"}, \"team_members\": [\"柴泽同\"]}', '127.0.0.1', '2025-12-30 10:23:58');
INSERT INTO `audit_logs` VALUES (15, 17, '创建科研项目', 'research_item', 669, 'null', '{\"title\": \"数据结构与算法分析 (Python版)\", \"status\": \"pending\", \"file_url\": null, \"subtype_id\": 1, \"content_json\": {\"isbn\": \"978-7-04-056789-1\", \"pages\": 520, \"publisher\": \"高等教育出版社\", \"publish_date\": \"2025-12-30\"}, \"team_members\": [\"柴泽同\"]}', '127.0.0.1', '2025-12-30 10:24:46');
INSERT INTO `audit_logs` VALUES (16, 18, '更新项目状态', 'research_item', 665, '{\"status\": \"pending\"}', '{\"status\": \"approved\", \"remarks\": null}', '127.0.0.1', '2025-12-30 10:25:06');
INSERT INTO `audit_logs` VALUES (17, 18, '更新项目状态', 'research_item', 666, '{\"status\": \"pending\"}', '{\"status\": \"approved\", \"remarks\": null}', '127.0.0.1', '2025-12-30 10:25:07');
INSERT INTO `audit_logs` VALUES (18, 18, '更新项目状态', 'research_item', 668, '{\"status\": \"pending\"}', '{\"status\": \"rejected\", \"remarks\": \"缺失材料\\n\"}', '127.0.0.1', '2025-12-30 10:25:18');
INSERT INTO `audit_logs` VALUES (19, 18, '更新项目状态', 'research_item', 667, '{\"status\": \"pending\"}', '{\"status\": \"approved\", \"remarks\": null}', '127.0.0.1', '2025-12-30 10:25:19');
INSERT INTO `audit_logs` VALUES (20, 18, '更新项目状态', 'research_item', 669, '{\"status\": \"pending\"}', '{\"status\": \"approved\", \"remarks\": null}', '127.0.0.1', '2025-12-30 10:25:19');
INSERT INTO `audit_logs` VALUES (21, 17, '创建科研项目', 'research_item', 670, 'null', '{\"title\": \"校园智慧安防监控管理系统 V2.0\", \"status\": \"pending\", \"file_url\": null, \"subtype_id\": 5, \"content_json\": {\"assignee\": \"\", \"inventor\": \"柴泽同\", \"grant_date\": \"2025-12-30\", \"patent_type\": \"软件著作权\", \"patent_number\": \"2023SR123456\"}, \"team_members\": [\"柴泽同\"]}', '127.0.0.1', '2025-12-30 10:30:22');
INSERT INTO `audit_logs` VALUES (22, 17, '创建科研项目', 'research_item', 671, 'null', '{\"title\": \"高性能国产数据库核心技术突破与产业化应用\", \"status\": \"pending\", \"file_url\": null, \"subtype_id\": 6, \"content_json\": {\"award_year\": 2025, \"award_level\": \"\", \"awarding_body\": \"中国电子学会\", \"certificate_no\": \"\"}, \"team_members\": [\"柴泽同\"]}', '127.0.0.1', '2025-12-30 10:31:09');
INSERT INTO `audit_logs` VALUES (23, 18, '更新项目状态', 'research_item', 670, '{\"status\": \"pending\"}', '{\"status\": \"approved\", \"remarks\": null}', '127.0.0.1', '2025-12-30 10:33:03');
INSERT INTO `audit_logs` VALUES (24, 18, '更新项目状态', 'research_item', 671, '{\"status\": \"pending\"}', '{\"status\": \"rejected\", \"remarks\": \"材料错误\"}', '127.0.0.1', '2025-12-30 10:33:11');
INSERT INTO `audit_logs` VALUES (25, 17, '创建科研项目', 'research_item', 672, 'null', '{\"title\": \"Efficient Transformer Architectures\", \"status\": \"pending\", \"file_url\": null, \"subtype_id\": 1, \"content_json\": {\"is_sci\": true, \"journal_name\": \"draft\", \"publish_date\": \"2025-12-18\", \"volume_issue\": \"\", \"impact_factor\": 5.4}, \"team_members\": [\"柴泽同\"]}', '127.0.0.1', '2025-12-30 10:36:22');
INSERT INTO `audit_logs` VALUES (26, 18, '更新项目状态', 'research_item', 672, '{\"status\": \"pending\"}', '{\"status\": \"approved\", \"remarks\": null}', '127.0.0.1', '2025-12-30 10:36:54');
INSERT INTO `audit_logs` VALUES (27, 17, '创建科研项目', 'research_item', 673, 'null', '{\"title\": \"Road Defect Detection Method Based on CBAM and Data Augmentation\", \"status\": \"pending\", \"file_url\": null, \"subtype_id\": 1, \"content_json\": {\"is_sci\": false, \"journal_name\": \"IEEE\", \"publish_date\": \"2025-12-18\", \"volume_issue\": \"10.1109/AIPMV67185.2025.11290066\", \"impact_factor\": 20}, \"team_members\": [\"柴泽同\"]}', '127.0.0.1', '2025-12-30 10:41:57');
INSERT INTO `audit_logs` VALUES (28, 17, '创建科研项目', 'research_item', 674, 'null', '{\"title\": \"基于深度强化学习的无人机集群协同路径规划方法\", \"status\": \"pending\", \"file_url\": null, \"subtype_id\": 3, \"content_json\": {\"is_sci\": false, \"journal_name\": \"计算机学报\", \"publish_date\": \"2025-12-21\", \"volume_issue\": \"Vol. 47, No. 3, pp. 567-580\", \"impact_factor\": 52}, \"team_members\": [\"柴泽同\"]}', '127.0.0.1', '2025-12-30 10:53:57');
INSERT INTO `audit_logs` VALUES (29, 17, '创建科研项目', 'research_item', 675, 'null', '{\"title\": \"A Comprehensive Survey on Large Language Models: Architectures, Applications, and Challenges\", \"status\": \"pending\", \"file_url\": null, \"subtype_id\": 3, \"content_json\": {\"is_sci\": true, \"journal_name\": \"IEEE Transactions on Knowledge and Data Engineering (TKDE)\", \"publish_date\": \"2025-09-28\", \"volume_issue\": \"Vol. 35, No. 11\", \"impact_factor\": 8.9}, \"team_members\": [\"孙朝阳\"]}', '127.0.0.1', '2025-12-30 10:58:05');

-- ----------------------------
-- Table structure for backups
-- ----------------------------
DROP TABLE IF EXISTS `backups`;
CREATE TABLE `backups`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of backups
-- ----------------------------

-- ----------------------------
-- Table structure for department_aliases
-- ----------------------------
DROP TABLE IF EXISTS `department_aliases`;
CREATE TABLE `department_aliases`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `alias` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `alias`(`alias` ASC) USING BTREE,
  INDEX `ix_department_aliases_id`(`id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 61 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of department_aliases
-- ----------------------------
INSERT INTO `department_aliases` VALUES (1, '计算机科学与技术学院', 'CS');
INSERT INTO `department_aliases` VALUES (2, '计院', 'CS');
INSERT INTO `department_aliases` VALUES (3, '计算机', 'CS');

-- ----------------------------
-- Table structure for departments
-- ----------------------------
DROP TABLE IF EXISTS `departments`;
CREATE TABLE `departments`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `code`(`code` ASC) USING BTREE,
  UNIQUE INDEX `name`(`name` ASC) USING BTREE,
  INDEX `ix_departments_id`(`id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 40 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of departments
-- ----------------------------
INSERT INTO `departments` VALUES (1, 'CS', '计算机科学与技术学院');
INSERT INTO `departments` VALUES (3, 'PHY', '物理学院');
INSERT INTO `departments` VALUES (4, 'CHEM', '化学与化工学院');
INSERT INTO `departments` VALUES (5, 'BIO', '生命科学学院');
INSERT INTO `departments` VALUES (6, 'MAT', '材料科学与工程学院');
INSERT INTO `departments` VALUES (7, 'MECH', '机械工程学院');
INSERT INTO `departments` VALUES (8, 'EE', '电子信息工程学院');
INSERT INTO `departments` VALUES (9, 'MATH', '数学学院');
INSERT INTO `departments` VALUES (10, 'STAT', '统计与数据科学学院');
INSERT INTO `departments` VALUES (11, 'AI', '人工智能学院');
INSERT INTO `departments` VALUES (12, 'CYBER', '网络空间安全学院');
INSERT INTO `departments` VALUES (13, 'AUTO', '自动化学院');
INSERT INTO `departments` VALUES (14, 'ENE', '能源与动力工程学院');
INSERT INTO `departments` VALUES (15, 'CIV', '土木工程学院');
INSERT INTO `departments` VALUES (16, 'ARCH', '建筑与城市规划学院');
INSERT INTO `departments` VALUES (17, 'ENV', '环境科学与工程学院');
INSERT INTO `departments` VALUES (18, 'MED', '基础医学院');
INSERT INTO `departments` VALUES (19, 'PHARM', '药学院');
INSERT INTO `departments` VALUES (20, 'SEM', '经济管理学院');

-- ----------------------------
-- Table structure for ext_academic_books
-- ----------------------------
DROP TABLE IF EXISTS `ext_academic_books`;
CREATE TABLE `ext_academic_books`  (
  `id` int NOT NULL,
  `publisher` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `isbn` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `publish_date` date NULL DEFAULT NULL,
  `pages` int NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  CONSTRAINT `fk_ext_book_item` FOREIGN KEY (`id`) REFERENCES `research_items` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ext_academic_books
-- ----------------------------

-- ----------------------------
-- Table structure for ext_academic_papers
-- ----------------------------
DROP TABLE IF EXISTS `ext_academic_papers`;
CREATE TABLE `ext_academic_papers`  (
  `id` int NOT NULL,
  `journal_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `impact_factor` float NULL DEFAULT NULL,
  `publish_date` date NULL DEFAULT NULL,
  `volume_issue` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `is_sci` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  CONSTRAINT `fk_ext_paper_item` FOREIGN KEY (`id`) REFERENCES `research_items` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ext_academic_papers
-- ----------------------------
INSERT INTO `ext_academic_papers` VALUES (674, '计算机学报', 52, '2025-12-21', 'Vol. 47, No. 3, pp. 567-580', 0);
INSERT INTO `ext_academic_papers` VALUES (675, 'IEEE Transactions on Knowledge and Data Engineering (TKDE)', 8.9, '2025-09-28', 'Vol. 35, No. 11', 1);

-- ----------------------------
-- Table structure for ext_awards
-- ----------------------------
DROP TABLE IF EXISTS `ext_awards`;
CREATE TABLE `ext_awards`  (
  `id` int NOT NULL,
  `awarding_body` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `award_level` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `award_year` int NULL DEFAULT NULL,
  `certificate_no` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  CONSTRAINT `fk_ext_award_item` FOREIGN KEY (`id`) REFERENCES `research_items` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ext_awards
-- ----------------------------
INSERT INTO `ext_awards` VALUES (666, '教育部', '省部级一等奖', 2025, '2023-J-201-1-01');
INSERT INTO `ext_awards` VALUES (671, '中国电子学会', '', 2025, '');

-- ----------------------------
-- Table structure for ext_horizontal_projects
-- ----------------------------
DROP TABLE IF EXISTS `ext_horizontal_projects`;
CREATE TABLE `ext_horizontal_projects`  (
  `id` int NOT NULL,
  `partner_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `contract_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `total_funding` decimal(12, 2) NULL DEFAULT NULL,
  `start_date` date NULL DEFAULT NULL,
  `end_date` date NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  CONSTRAINT `fk_ext_h_item` FOREIGN KEY (`id`) REFERENCES `research_items` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ext_horizontal_projects
-- ----------------------------
INSERT INTO `ext_horizontal_projects` VALUES (660, '深圳市大疆创新科技有限公司', 'HT-2024-DJI-003', 120.00, '2025-12-20', '2025-10-25');
INSERT INTO `ext_horizontal_projects` VALUES (661, '深圳市大疆创新科技有限公司', 'HT-2024-DJI-003', 120.00, '2025-12-18', '2025-12-24');
INSERT INTO `ext_horizontal_projects` VALUES (662, '深圳市大疆创新科技有限公司', 'HT-2024-DJI-003', 222.00, '2025-10-10', '2025-12-30');
INSERT INTO `ext_horizontal_projects` VALUES (667, '比亚迪汽车工业有限公司', 'JS-2024-BYD-009', 200.00, '2025-12-30', '2025-12-30');

-- ----------------------------
-- Table structure for ext_patents
-- ----------------------------
DROP TABLE IF EXISTS `ext_patents`;
CREATE TABLE `ext_patents`  (
  `id` int NOT NULL,
  `patent_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `grant_date` date NULL DEFAULT NULL,
  `inventor` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `patent_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `assignee` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  CONSTRAINT `fk_ext_patent_item` FOREIGN KEY (`id`) REFERENCES `research_items` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ext_patents
-- ----------------------------
INSERT INTO `ext_patents` VALUES (665, 'ZL202310567890.X', '2025-12-30', '柴泽同', '发明专利', '');
INSERT INTO `ext_patents` VALUES (670, '2023SR123456', '2025-12-30', '柴泽同', '软件著作权', '');

-- ----------------------------
-- Table structure for ext_vertical_projects
-- ----------------------------
DROP TABLE IF EXISTS `ext_vertical_projects`;
CREATE TABLE `ext_vertical_projects`  (
  `id` int NOT NULL,
  `project_source` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `approval_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `total_funding` decimal(12, 2) NULL DEFAULT NULL,
  `project_level` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `start_date` date NULL DEFAULT NULL,
  `end_date` date NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  CONSTRAINT `fk_ext_v_item` FOREIGN KEY (`id`) REFERENCES `research_items` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ext_vertical_projects
-- ----------------------------
INSERT INTO `ext_vertical_projects` VALUES (663, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `ext_vertical_projects` VALUES (664, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `ext_vertical_projects` VALUES (668, '省级自然科学基金', '2024ZR05123', 10.00, '省部级', '2025-12-01', '2025-12-30');
INSERT INTO `ext_vertical_projects` VALUES (669, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `ext_vertical_projects` VALUES (672, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `ext_vertical_projects` VALUES (673, NULL, NULL, NULL, NULL, NULL, NULL);

-- ----------------------------
-- Table structure for notice_recipients
-- ----------------------------
DROP TABLE IF EXISTS `notice_recipients`;
CREATE TABLE `notice_recipients`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `notice_id` int NOT NULL,
  `user_id` int NOT NULL,
  `is_read` tinyint(1) NULL DEFAULT NULL,
  `read_at` datetime NULL DEFAULT NULL,
  `created_at` datetime NULL DEFAULT (now()),
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `notice_id`(`notice_id` ASC) USING BTREE,
  INDEX `user_id`(`user_id` ASC) USING BTREE,
  INDEX `ix_notice_recipients_id`(`id` ASC) USING BTREE,
  CONSTRAINT `notice_recipients_ibfk_1` FOREIGN KEY (`notice_id`) REFERENCES `notices` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `notice_recipients_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 19 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of notice_recipients
-- ----------------------------
INSERT INTO `notice_recipients` VALUES (10, 7, 17, 0, NULL, '2025-12-30 08:55:48');
INSERT INTO `notice_recipients` VALUES (11, 9, 22, 0, NULL, '2025-12-30 09:29:02');
INSERT INTO `notice_recipients` VALUES (12, 11, 25, 0, NULL, '2025-12-30 09:43:24');
INSERT INTO `notice_recipients` VALUES (13, 12, 26, 0, NULL, '2025-12-30 09:52:04');
INSERT INTO `notice_recipients` VALUES (14, 13, 17, 0, NULL, '2025-12-30 10:33:48');
INSERT INTO `notice_recipients` VALUES (15, 14, 17, 0, NULL, '2025-12-30 12:02:55');
INSERT INTO `notice_recipients` VALUES (16, 15, 17, 0, NULL, '2025-12-30 12:03:22');
INSERT INTO `notice_recipients` VALUES (17, 16, 17, 0, NULL, '2025-12-30 12:03:46');
INSERT INTO `notice_recipients` VALUES (18, 17, 17, 0, NULL, '2025-12-30 12:04:03');

-- ----------------------------
-- Table structure for notices
-- ----------------------------
DROP TABLE IF EXISTS `notices`;
CREATE TABLE `notices`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` varchar(2000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_role` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_dept_id` int NULL DEFAULT NULL,
  `publisher` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` datetime NULL DEFAULT (now()),
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `target_dept_id`(`target_dept_id` ASC) USING BTREE,
  INDEX `ix_notices_id`(`id` ASC) USING BTREE,
  CONSTRAINT `notices_ibfk_1` FOREIGN KEY (`target_dept_id`) REFERENCES `departments` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 18 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of notices
-- ----------------------------
INSERT INTO `notices` VALUES (7, '2025年末横向项目批次', '截止时间', 'all', 1, '发布中心', '2025-12-30 08:55:48');
INSERT INTO `notices` VALUES (8, '2025年末学术论文批次', '截止时间', 'all', 3, '发布中心', '2025-12-30 09:13:20');
INSERT INTO `notices` VALUES (9, '2025年初横向项目批次', '截止时间', 'all', 4, '发布中心', '2025-12-30 09:29:02');
INSERT INTO `notices` VALUES (10, '2024年年末纵向批次', '截止时间', 'all', 5, '发布中心', '2025-12-30 09:36:21');
INSERT INTO `notices` VALUES (11, '2024年末横向批次', '截止时间', 'all', 5, '发布中心', '2025-12-30 09:43:24');
INSERT INTO `notices` VALUES (12, '2024年末学术科研批次', '截止时间', 'all', 6, '发布中心', '2025-12-30 09:52:04');
INSERT INTO `notices` VALUES (13, '2024年末学术论文批次', '截止时间', 'all', 1, '发布中心', '2025-12-30 10:33:48');
INSERT INTO `notices` VALUES (14, '2025年末纵向批次', '截止时间', 'all', 1, '发布中心', '2025-12-30 12:02:55');
INSERT INTO `notices` VALUES (15, '2025年末出版专著批次', '截止时间', 'all', 1, '发布中心', '2025-12-30 12:03:22');
INSERT INTO `notices` VALUES (16, '2025年专利成果批次', '截止时间', 'all', 1, '发布中心', '2025-12-30 12:03:46');
INSERT INTO `notices` VALUES (17, '2025年专利获奖批次', '截止时间', 'all', 1, '发布中心', '2025-12-30 12:04:03');

-- ----------------------------
-- Table structure for permissions_catalog
-- ----------------------------
DROP TABLE IF EXISTS `permissions_catalog`;
CREATE TABLE `permissions_catalog`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `module` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `enabled` tinyint(1) NULL DEFAULT NULL,
  `created_at` datetime NULL DEFAULT (now()),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `code`(`code` ASC) USING BTREE,
  INDEX `ix_permissions_catalog_id`(`id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 132 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of permissions_catalog
-- ----------------------------
INSERT INTO `permissions_catalog` VALUES (1, 'system.health.view', '查看系统健康', 'System', NULL, NULL, '2025-12-29 23:35:45');
INSERT INTO `permissions_catalog` VALUES (2, 'system.backup.run', '执行备份', 'System', NULL, NULL, '2025-12-29 23:35:45');
INSERT INTO `permissions_catalog` VALUES (3, 'system.cache.clear', '清理缓存', 'System', NULL, NULL, '2025-12-29 23:35:45');
INSERT INTO `permissions_catalog` VALUES (4, 'system.users.manage', '用户管理', 'System', NULL, NULL, '2025-12-29 23:35:45');
INSERT INTO `permissions_catalog` VALUES (5, 'system.rbac.manage', '角色与权限管理', 'System', NULL, NULL, '2025-12-29 23:35:45');
INSERT INTO `permissions_catalog` VALUES (6, 'master.departments.manage', '学院字典管理', 'System', NULL, NULL, '2025-12-29 23:35:45');
INSERT INTO `permissions_catalog` VALUES (7, 'research.audit', '科研审核', 'Research', NULL, NULL, '2025-12-29 23:35:45');
INSERT INTO `permissions_catalog` VALUES (8, 'research.notice.publish', '发布通知', 'Research', NULL, NULL, '2025-12-29 23:35:45');
INSERT INTO `permissions_catalog` VALUES (9, 'research.stats.view', '查看科研统计', 'Research', NULL, NULL, '2025-12-29 23:35:45');
INSERT INTO `permissions_catalog` VALUES (10, 'research.data.export', '数据导出', 'Research', NULL, NULL, '2025-12-29 23:35:45');

-- ----------------------------
-- Table structure for phase_submissions
-- ----------------------------
DROP TABLE IF EXISTS `phase_submissions`;
CREATE TABLE `phase_submissions`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `phase_id` int NOT NULL,
  `applicant_id` int NOT NULL,
  `dept_id` bigint NULL DEFAULT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'not_started',
  `submitted_at` timestamp NULL DEFAULT NULL,
  `file_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `remarks` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `return_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `content_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `is_draft` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_submission_phase`(`phase_id` ASC) USING BTREE,
  CONSTRAINT `fk_submission_phase` FOREIGN KEY (`phase_id`) REFERENCES `project_phases` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of phase_submissions
-- ----------------------------

-- ----------------------------
-- Table structure for project_batches
-- ----------------------------
DROP TABLE IF EXISTS `project_batches`;
CREATE TABLE `project_batches`  (
  `batch_id` bigint NOT NULL AUTO_INCREMENT,
  `batch_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `publisher_dept_id` bigint NOT NULL,
  `notice_id` int NOT NULL,
  PRIMARY KEY (`batch_id`) USING BTREE,
  UNIQUE INDEX `uniq_notice_id`(`notice_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 181 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of project_batches
-- ----------------------------
INSERT INTO `project_batches` VALUES (1, '2025年末横向项目批次', 1, 7);
INSERT INTO `project_batches` VALUES (13, '2025年初横向项目批次', 4, 9);
INSERT INTO `project_batches` VALUES (15, '2024年末横向批次', 5, 11);
INSERT INTO `project_batches` VALUES (17, '2024年末学术科研批次', 6, 12);
INSERT INTO `project_batches` VALUES (45, '2024年末学术论文批次', 1, 13);
INSERT INTO `project_batches` VALUES (109, '2025年专利获奖批次', 1, 17);
INSERT INTO `project_batches` VALUES (111, '2025年专利成果批次', 1, 16);
INSERT INTO `project_batches` VALUES (112, '2025年末出版专著批次', 1, 15);
INSERT INTO `project_batches` VALUES (113, '2025年末纵向批次', 1, 14);

-- ----------------------------
-- Table structure for project_notices
-- ----------------------------
DROP TABLE IF EXISTS `project_notices`;
CREATE TABLE `project_notices`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `publish_by` int NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of project_notices
-- ----------------------------

-- ----------------------------
-- Table structure for project_phases
-- ----------------------------
DROP TABLE IF EXISTS `project_phases`;
CREATE TABLE `project_phases`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `notice_id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `deadline` date NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_phase_notice`(`notice_id` ASC) USING BTREE,
  CONSTRAINT `fk_phase_notice` FOREIGN KEY (`notice_id`) REFERENCES `project_notices` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of project_phases
-- ----------------------------

-- ----------------------------
-- Table structure for projects
-- ----------------------------
DROP TABLE IF EXISTS `projects`;
CREATE TABLE `projects`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `status` int NOT NULL DEFAULT 1,
  `applicant_id` int NOT NULL,
  `content_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of projects
-- ----------------------------

-- ----------------------------
-- Table structure for research_collaborators
-- ----------------------------
DROP TABLE IF EXISTS `research_collaborators`;
CREATE TABLE `research_collaborators`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `item_id` int NOT NULL,
  `user_id` int NOT NULL,
  `role` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `item_id`(`item_id` ASC) USING BTREE,
  INDEX `user_id`(`user_id` ASC) USING BTREE,
  INDEX `ix_research_collaborators_id`(`id` ASC) USING BTREE,
  CONSTRAINT `research_collaborators_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `research_items` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `research_collaborators_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 22 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of research_collaborators
-- ----------------------------
INSERT INTO `research_collaborators` VALUES (5, 660, 17, 'participant');
INSERT INTO `research_collaborators` VALUES (6, 661, 17, 'participant');
INSERT INTO `research_collaborators` VALUES (7, 661, 22, 'participant');
INSERT INTO `research_collaborators` VALUES (8, 662, 25, 'participant');
INSERT INTO `research_collaborators` VALUES (9, 663, 17, 'participant');
INSERT INTO `research_collaborators` VALUES (10, 664, 26, 'participant');
INSERT INTO `research_collaborators` VALUES (11, 665, 17, 'participant');
INSERT INTO `research_collaborators` VALUES (12, 666, 17, 'participant');
INSERT INTO `research_collaborators` VALUES (13, 667, 17, 'participant');
INSERT INTO `research_collaborators` VALUES (14, 668, 17, 'participant');
INSERT INTO `research_collaborators` VALUES (15, 669, 17, 'participant');
INSERT INTO `research_collaborators` VALUES (16, 670, 17, 'participant');
INSERT INTO `research_collaborators` VALUES (17, 671, 17, 'participant');
INSERT INTO `research_collaborators` VALUES (18, 672, 17, 'participant');
INSERT INTO `research_collaborators` VALUES (19, 673, 17, 'participant');
INSERT INTO `research_collaborators` VALUES (20, 674, 17, 'participant');
INSERT INTO `research_collaborators` VALUES (21, 675, 18, 'participant');

-- ----------------------------
-- Table structure for research_items
-- ----------------------------
DROP TABLE IF EXISTS `research_items`;
CREATE TABLE `research_items`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int NOT NULL,
  `subtype_id` int NOT NULL,
  `content_hash` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `content_json` json NULL,
  `status` enum('draft','pending','approved','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `file_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `audit_remarks` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `approve_time` datetime NULL DEFAULT NULL,
  `created_at` datetime NULL DEFAULT (now()),
  `updated_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uq_user_subtype_contenthash`(`user_id` ASC, `subtype_id` ASC, `content_hash` ASC) USING BTREE,
  INDEX `subtype_id`(`subtype_id` ASC) USING BTREE,
  INDEX `ix_research_items_content_hash`(`content_hash` ASC) USING BTREE,
  INDEX `ix_research_items_id`(`id` ASC) USING BTREE,
  CONSTRAINT `research_items_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `research_items_ibfk_2` FOREIGN KEY (`subtype_id`) REFERENCES `research_subtypes` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 676 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of research_items
-- ----------------------------
INSERT INTO `research_items` VALUES (660, '基于计算机视觉的工业缺陷检测算法研发', 17, 2, '71761bc7c2ba315aa96a8c4454dd5a32739383030fe6fc626bbd4869a4faf857', '{\"end_date\": \"2025-10-25\", \"start_date\": \"2025-12-20\", \"partner_name\": \"深圳市大疆创新科技有限公司\", \"total_funding\": 120, \"contract_number\": \"HT-2024-DJI-003\"}', 'rejected', NULL, NULL, NULL, '2025-12-30 09:01:38', '2025-12-30 09:05:01');
INSERT INTO `research_items` VALUES (661, '基于计算机视觉的工业缺陷检测算法研发', 22, 2, 'f04b32ce57d6b7d35de14c36a899220c17a18648b66ea6544ad49557a3d7c1f2', '{\"end_date\": \"2025-12-24\", \"start_date\": \"2025-12-18\", \"partner_name\": \"深圳市大疆创新科技有限公司\", \"total_funding\": 120, \"contract_number\": \"HT-2024-DJI-003\"}', 'approved', NULL, NULL, NULL, '2025-12-30 09:31:57', '2025-12-30 09:32:54');
INSERT INTO `research_items` VALUES (662, '工业缺陷检测算法研发', 25, 2, '3210d5181009ce616c2ef630d8cdaa67c7a486c668d82c0b75347d557e6b9634', '{\"end_date\": \"2025-12-30\", \"start_date\": \"2025-10-10\", \"partner_name\": \"深圳市大疆创新科技有限公司\", \"total_funding\": 222, \"contract_number\": \"HT-2024-DJI-003\"}', 'approved', NULL, NULL, NULL, '2025-12-30 09:45:24', '2025-12-30 09:45:54');
INSERT INTO `research_items` VALUES (663, 'A Novel Attention Mechanism for Multimodal Sentiment Analysis', 26, 3, '39c1cda60208e586bbb7bb5fa51da099d38bc90917cd91a4ff94e759c91a165d', '{\"is_sci\": true, \"journal_name\": \"A Novel Attention Mechanism for Multimodal Sentiment Analysis\", \"publish_date\": \"2025-12-31\", \"volume_issue\": \"Vol. 46, No. 5, pp. 3421-3435\", \"impact_factor\": 24.31}', 'rejected', NULL, NULL, NULL, '2025-12-30 09:54:06', '2025-12-30 09:54:48');
INSERT INTO `research_items` VALUES (664, 'A Novel Attention Mechanism', 26, 3, '5d55cafb5b31e73115eeca2b9786b8d6d6159ac6d3d6d640a11eafa794b1d439', '{\"is_sci\": true, \"journal_name\": \"IEEE TPAMI\", \"publish_date\": \"2025-12-30\", \"volume_issue\": \"Vol. 46, No. 5, pp. 3421-3435\", \"impact_factor\": 32}', 'approved', NULL, NULL, NULL, '2025-12-30 10:00:14', '2025-12-30 10:09:13');
INSERT INTO `research_items` VALUES (665, '一种基于区块链的高校科研数据防篡改存证方法', 17, 5, '702b6a8523e211876fc0ef22f34ad132a6f40468e082e9ba38ce389a79668d9a', '{\"assignee\": \"\", \"inventor\": \"柴泽同\", \"grant_date\": \"2025-12-30\", \"patent_type\": \"发明专利\", \"patent_number\": \"ZL202310567890.X\"}', 'approved', NULL, NULL, NULL, '2025-12-30 10:11:02', '2025-12-30 10:25:06');
INSERT INTO `research_items` VALUES (666, '复杂网络环境下的多模态数据融合关键技术及应用', 17, 6, 'd7be83618de83f309f262e613dd82ca71a4136cbfe2945570b612480a5471686', '{\"award_year\": 2025, \"award_level\": \"省部级一等奖\", \"awarding_body\": \"教育部\", \"certificate_no\": \"2023-J-201-1-01\"}', 'approved', NULL, NULL, NULL, '2025-12-30 10:11:48', '2025-12-30 10:25:07');
INSERT INTO `research_items` VALUES (667, '新能源汽车电池热管理系统仿真与优化服务', 17, 2, '906497c67f80bd53436edf296aa95c856169f176753a5b3c31da30dccc55ba95', '{\"end_date\": \"2025-12-30\", \"start_date\": \"2025-12-30\", \"partner_name\": \"比亚迪汽车工业有限公司\", \"total_funding\": 200, \"contract_number\": \"JS-2024-BYD-009\"}', 'approved', NULL, NULL, NULL, '2025-12-30 10:22:32', '2025-12-30 10:25:19');
INSERT INTO `research_items` VALUES (668, '基于多源遥感数据的城市热岛效应演变机制研究', 17, 1, '0a6c052e7553cf682e034d2832c3641ab3e37cbf0a0c554786ffe44966a0700a', '{\"end_date\": \"2025-12-30\", \"start_date\": \"2025-12-01\", \"project_level\": \"省部级\", \"total_funding\": 10, \"project_source\": \"省级自然科学基金\", \"approval_number\": \"2024ZR05123\"}', 'rejected', NULL, NULL, NULL, '2025-12-30 10:23:58', '2025-12-30 10:25:18');
INSERT INTO `research_items` VALUES (669, '数据结构与算法分析 (Python版)', 17, 1, '44b2def1643a6d982d566f7d5023c3ec75f77987f70ee9239dc449e2e8412058', '{\"isbn\": \"978-7-04-056789-1\", \"pages\": 520, \"publisher\": \"高等教育出版社\", \"publish_date\": \"2025-12-30\"}', 'approved', NULL, NULL, NULL, '2025-12-30 10:24:46', '2025-12-30 10:25:19');
INSERT INTO `research_items` VALUES (670, '校园智慧安防监控管理系统 V2.0', 17, 5, 'e6b7021ecec46e88080b16d3ba1483684c5d1cfaa50a36a877ba1cf7d7ec3887', '{\"assignee\": \"\", \"inventor\": \"柴泽同\", \"grant_date\": \"2025-12-30\", \"patent_type\": \"软件著作权\", \"patent_number\": \"2023SR123456\"}', 'approved', NULL, NULL, NULL, '2025-12-30 10:30:22', '2025-12-30 10:33:03');
INSERT INTO `research_items` VALUES (671, '高性能国产数据库核心技术突破与产业化应用', 17, 6, '155a1aeb74831f5a8050be96d43299f6519a42c3bc0ccb01dbec3043c8c31c36', '{\"award_year\": 2025, \"award_level\": \"\", \"awarding_body\": \"中国电子学会\", \"certificate_no\": \"\"}', 'rejected', NULL, NULL, NULL, '2025-12-30 10:31:09', '2025-12-30 10:33:11');
INSERT INTO `research_items` VALUES (672, 'Efficient Transformer Architectures', 17, 3, 'ccc7681250452a3bd656921df5029dcb684b871c7d786861c0e982e04092bb06', '{\"is_sci\": true, \"journal_name\": \"draft\", \"publish_date\": \"2025-12-18\", \"volume_issue\": \"\", \"impact_factor\": 5.4}', 'approved', NULL, NULL, NULL, '2025-12-30 10:36:22', '2025-12-30 10:36:54');
INSERT INTO `research_items` VALUES (673, 'Road Defect Detection Method Based on CBAM and Data Augmentation', 17, 3, '30bb5370ea2d3a35136f7253b1aca6c7c5c4193d8471bec59c5b71b2d73d18db', '{\"is_sci\": false, \"journal_name\": \"IEEE\", \"publish_date\": \"2025-12-18\", \"volume_issue\": \"10.1109/AIPMV67185.2025.11290066\", \"impact_factor\": 20}', 'pending', NULL, NULL, NULL, '2025-12-30 10:41:57', NULL);
INSERT INTO `research_items` VALUES (674, '基于深度强化学习的无人机集群协同路径规划方法', 17, 3, 'b4929cf7cc203e5f51a6d218811c4a50db0edff718c1f2f58403f14f40cca5e9', '{\"is_sci\": false, \"journal_name\": \"计算机学报\", \"publish_date\": \"2025-12-21\", \"volume_issue\": \"Vol. 47, No. 3, pp. 567-580\", \"impact_factor\": 52}', 'pending', NULL, NULL, NULL, '2025-12-30 10:53:57', NULL);
INSERT INTO `research_items` VALUES (675, 'A Comprehensive Survey on Large Language Models: Architectures, Applications, and Challenges', 17, 3, 'b5b3b066addc822a55c7e3d50143eac796493ff97510774a652e3d95f922d28b', '{\"is_sci\": true, \"journal_name\": \"IEEE Transactions on Knowledge and Data Engineering (TKDE)\", \"publish_date\": \"2025-09-28\", \"volume_issue\": \"Vol. 35, No. 11\", \"impact_factor\": 8.9}', 'pending', NULL, NULL, NULL, '2025-12-30 10:58:05', NULL);

-- ----------------------------
-- Table structure for research_subtypes
-- ----------------------------
DROP TABLE IF EXISTS `research_subtypes`;
CREATE TABLE `research_subtypes`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `ix_research_subtypes_id`(`id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 19 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of research_subtypes
-- ----------------------------
INSERT INTO `research_subtypes` VALUES (1, '纵向科研项目');
INSERT INTO `research_subtypes` VALUES (2, '横向科研项目');
INSERT INTO `research_subtypes` VALUES (3, '学术论文');
INSERT INTO `research_subtypes` VALUES (4, '出版著作');
INSERT INTO `research_subtypes` VALUES (5, '专利成果');
INSERT INTO `research_subtypes` VALUES (6, '科研获奖');

-- ----------------------------
-- Table structure for review_templates
-- ----------------------------
DROP TABLE IF EXISTS `review_templates`;
CREATE TABLE `review_templates`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `is_shared` tinyint(1) NULL DEFAULT 0,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of review_templates
-- ----------------------------
INSERT INTO `review_templates` VALUES (7, '材料缺失驳回', '您好{applicant_name}，您的项目{project_title}，由于{missing_docs}，所以驳回。', 0, '2025-12-30 09:03:28');
INSERT INTO `review_templates` VALUES (8, '经费预算过高', '您好{applicant_name}，您的项目{project_title}，由于经费过高而被驳回。', 0, '2025-12-30 11:03:46');

-- ----------------------------
-- Table structure for role_permissions
-- ----------------------------
DROP TABLE IF EXISTS `role_permissions`;
CREATE TABLE `role_permissions`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_id` int NOT NULL,
  `code` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `role_id`(`role_id` ASC) USING BTREE,
  INDEX `ix_role_permissions_id`(`id` ASC) USING BTREE,
  CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of role_permissions
-- ----------------------------
INSERT INTO `role_permissions` VALUES (1, 6, 'system.health.view');
INSERT INTO `role_permissions` VALUES (2, 6, 'system.users.manage');
INSERT INTO `role_permissions` VALUES (3, 6, 'system.rbac.manage');
INSERT INTO `role_permissions` VALUES (4, 5, 'research.audit');
INSERT INTO `role_permissions` VALUES (5, 5, 'research.notice.publish');
INSERT INTO `role_permissions` VALUES (6, 5, 'research.stats.view');
INSERT INTO `role_permissions` VALUES (7, 4, 'research.data.export');

-- ----------------------------
-- Table structure for roles
-- ----------------------------
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `is_system` tinyint(1) NULL DEFAULT NULL,
  `created_at` datetime NULL DEFAULT (now()),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `name`(`name` ASC) USING BTREE,
  INDEX `ix_roles_id`(`id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 10 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of roles
-- ----------------------------
INSERT INTO `roles` VALUES (1, '系统管理员', '系统管理权限', 1, '2025-12-29 23:35:45');
INSERT INTO `roles` VALUES (2, '科研管理员', '科研管理权限', 1, '2025-12-29 23:35:45');
INSERT INTO `roles` VALUES (3, '教师', '教师默认权限', 1, '2025-12-29 23:35:45');
INSERT INTO `roles` VALUES (4, 'teacher', '教师/科研人员', 1, '2025-12-30 00:29:19');
INSERT INTO `roles` VALUES (5, 'research_admin', '科研管理员', 1, '2025-12-30 00:29:19');
INSERT INTO `roles` VALUES (6, 'sys_admin', '系统管理员', 1, '2025-12-30 00:29:19');

-- ----------------------------
-- Table structure for submission_attachments
-- ----------------------------
DROP TABLE IF EXISTS `submission_attachments`;
CREATE TABLE `submission_attachments`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int NOT NULL,
  `filename` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `size_bytes` bigint NULL DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_attach_submission`(`submission_id` ASC) USING BTREE,
  CONSTRAINT `fk_attach_submission` FOREIGN KEY (`submission_id`) REFERENCES `phase_submissions` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of submission_attachments
-- ----------------------------

-- ----------------------------
-- Table structure for user_experiences
-- ----------------------------
DROP TABLE IF EXISTS `user_experiences`;
CREATE TABLE `user_experiences`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` date NULL DEFAULT NULL,
  `end_date` date NULL DEFAULT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `institution` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `description` varchar(2000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `order_index` int NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `user_id`(`user_id` ASC) USING BTREE,
  INDEX `ix_user_experiences_id`(`id` ASC) USING BTREE,
  CONSTRAINT `user_experiences_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 15 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user_experiences
-- ----------------------------
INSERT INTO `user_experiences` VALUES (10, 22, 'work', '2025-09-20', '2025-12-30', '组长', '字节跳动', '', NULL);
INSERT INTO `user_experiences` VALUES (11, 25, 'work', '2025-12-02', '2025-12-31', '经理', '京东', '', NULL);
INSERT INTO `user_experiences` VALUES (12, 26, 'education', '2025-10-01', '2025-12-30', '教师', '材料科学与工程学院', '', NULL);
INSERT INTO `user_experiences` VALUES (13, 17, 'work', '2023-09-30', '2027-06-30', '博士', '河北工业大学', '', NULL);
INSERT INTO `user_experiences` VALUES (14, 17, 'work', '2020-09-30', '2023-06-30', '硕士', '河北工业大学', '', NULL);

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `hashed_password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NULL DEFAULT NULL,
  `is_superuser` tinyint(1) NULL DEFAULT NULL,
  `role` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `dept_id` int NULL DEFAULT NULL,
  `employee_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `gender` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `birth_date` date NULL DEFAULT NULL,
  `phone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `office_location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `highest_education` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `degree` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `alma_mater` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `major` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `research_direction` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `advisor_qualification` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `profile_public` tinyint(1) NULL DEFAULT NULL,
  `department` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `department_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `ix_users_email`(`email` ASC) USING BTREE,
  INDEX `ix_users_id`(`id` ASC) USING BTREE,
  INDEX `ix_users_full_name`(`full_name` ASC) USING BTREE,
  INDEX `ix_users_dept_id`(`dept_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 30 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'System Admin', 'admin@local', '$pbkdf2-sha256$29000$CaH03ru3Vqr1fu8dY0wp5Q$erFBHMp7cpG1Cb09kQbX33Cf1LE3sK0/3h3KgO8nKoU', 1, 1, 'sys_admin', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '计算机科学与技术学院', 'CS');
INSERT INTO `users` VALUES (17, '柴泽同', 'czt@123.com', '$pbkdf2-sha256$29000$v1eKkfKe874XAgCgdG6NsQ$qtNs/xF3jDmzdHC3KFKc91I/PtBwyWJjRpmLxyJjIzs', 1, 0, 'teacher', 1, '234891', NULL, NULL, '820260', '河北工业大学研究院', '博士', '博士', '河北工业大学', '计算机科学与技术', '机器学习', '博导', 1, '计算机科学与技术学院', 'CS');
INSERT INTO `users` VALUES (18, '孙朝阳', 'szy@123.com', '$pbkdf2-sha256$29000$r3WOMSYE4NwbA6D0vjemNA$PyeCjHLeax.IyDNLRfer/RB.hzrCwTvxTIQOqUQ8E8g', 1, 0, 'research_admin', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '计算机科学与技术学院', 'CS');
INSERT INTO `users` VALUES (19, '李汶骏', 'lwj@123.com', '$pbkdf2-sha256$29000$JwTAGCPkHGMshXCOkZISQg$Btd7tafYvSiRohkO3/QZ15l1nFDWp1XWytU.JWsgS7Y', 1, 1, 'sys_admin', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL);
INSERT INTO `users` VALUES (21, '李文泽', 'lwz@123.com', '$pbkdf2-sha256$29000$0zrnnLP2nvO.V8qZM6bUGg$Xbw0/7FMgbS7V.1fR8sPgPC3AGAvhBQmcauaL39.yOw', 1, 0, 'research_admin', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '物理学院', 'PHY');
INSERT INTO `users` VALUES (22, '薛汉林', 'xhl@123.com', '$pbkdf2-sha256$29000$tFYqJQQAAADgPOe8d.4d4w$kI9Ro//XZoEH4L052DzX2NgbpUXG1Eya0EKRrHtLWA0', 1, 0, 'teacher', 4, '311', NULL, NULL, '151515111', 'b121', '本科', '本科生', '河北工业大学', '化学与化工学院', '化学与化工研究', '硕导', 0, '化学与化工学院', 'CHEM');
INSERT INTO `users` VALUES (23, '黄文', 'hw@123.com', '$pbkdf2-sha256$29000$ck7pHSPk3Pv/v5dSam3NmQ$vzYW7TH7PU28URAjdQOaiKG43x8dCgX7E/x3yRgb/ZI', 1, 0, 'research_admin', 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '化学与化工学院', 'CHEM');
INSERT INTO `users` VALUES (24, '杜室霖', 'dsl@123.com', '$pbkdf2-sha256$29000$COF8r1VKSUmJcQ6hVIoxhg$LgjDvJi47sPl3VnSoKG2LcfYlzNn1krEbmaDUunQCeE', 1, 0, 'research_admin', 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '', NULL, NULL, 0, '生命科学学院', 'BIO');
INSERT INTO `users` VALUES (25, '李行健', 'lxj@123.com', '$pbkdf2-sha256$29000$JiSEkLJWihFCiJHSes.ZUw$syYoCSgyZldKPI5Izf.8lQboSitQ26p45coOwG04RDo', 1, 0, 'teacher', 5, '511', NULL, NULL, '18314561876', 'b121', '博士', '博士学位', '河北工业大学', '生命科学学院', NULL, '博导', 0, '生命科学学院', 'BIO');
INSERT INTO `users` VALUES (26, '曲丽蓉', 'qlr@123.com', '$pbkdf2-sha256$29000$qtU6RwjhvFeKcY7xPufcmw$Fk5bI2xBF1OZ1zMBuwHm0YtddmBb5a2/gVCv7Gyt/AA', 1, 0, 'teacher', 6, '611', NULL, NULL, '14555686324', '河北工业大学', '本科', '本科生', '河北工业大学', '材料科学与工程', NULL, '硕导', 0, '材料科学与工程学院', 'MAT');
INSERT INTO `users` VALUES (27, '孟宪成', 'mxc@123.com', '$pbkdf2-sha256$29000$ei9FSEnpXQtBqDXG.L/3Xg$UgkvWPqgWTFaX7Bmbdszi6A6fybDOTqnxZLsU0xj7Pk', 1, 0, 'research_admin', 6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '材料科学与工程学院', 'MAT');

SET FOREIGN_KEY_CHECKS = 1;
