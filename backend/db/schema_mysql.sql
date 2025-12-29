-- MySQL schema restore for University Research Info System
-- Database: research_db
-- Charset: utf8mb4

CREATE TABLE IF NOT EXISTS departments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS department_aliases (
  id INT PRIMARY KEY AUTO_INCREMENT,
  alias VARCHAR(255) NOT NULL UNIQUE,
  code VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(255),
  email VARCHAR(255) NOT NULL UNIQUE,
  hashed_password VARCHAR(255) NOT NULL,
  is_active TINYINT(1) DEFAULT 1,
  is_superuser TINYINT(1) DEFAULT 0,
  role VARCHAR(50) DEFAULT 'teacher',
  dept_id INT NULL,
  employee_id VARCHAR(100),
  gender VARCHAR(20),
  birth_date DATE NULL,
  phone VARCHAR(50),
  office_location VARCHAR(255),
  highest_education VARCHAR(100),
  degree VARCHAR(100),
  alma_mater VARCHAR(255),
  major VARCHAR(255),
  research_direction VARCHAR(500),
  advisor_qualification VARCHAR(50),
  profile_public TINYINT(1) DEFAULT 0,
  INDEX idx_users_dept_id (dept_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS research_subtypes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS research_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  user_id INT NOT NULL,
  subtype_id INT NOT NULL,
  content_hash VARCHAR(64),
  content_json JSON,
  status ENUM('draft','pending','approved','rejected') DEFAULT 'draft',
  file_url VARCHAR(500),
  audit_remarks TEXT,
  approve_time DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_user_subtype_contenthash UNIQUE (user_id, subtype_id, content_hash),
  INDEX idx_research_items_user (user_id),
  INDEX idx_research_items_subtype (subtype_id),
  INDEX idx_research_items_content_hash (content_hash),
  CONSTRAINT fk_ri_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_ri_subtype FOREIGN KEY (subtype_id) REFERENCES research_subtypes(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS research_collaborators (
  id INT PRIMARY KEY AUTO_INCREMENT,
  item_id INT NOT NULL,
  user_id INT NOT NULL,
  role VARCHAR(100) DEFAULT 'participant',
  INDEX idx_rc_item (item_id),
  INDEX idx_rc_user (user_id),
  CONSTRAINT fk_rc_item FOREIGN KEY (item_id) REFERENCES research_items(id) ON DELETE CASCADE,
  CONSTRAINT fk_rc_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ext_vertical_projects (
  id INT PRIMARY KEY,
  project_source VARCHAR(100),
  approval_number VARCHAR(50),
  total_funding DECIMAL(12,2),
  project_level VARCHAR(50),
  start_date DATE,
  end_date DATE,
  CONSTRAINT fk_ext_v_item FOREIGN KEY (id) REFERENCES research_items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ext_horizontal_projects (
  id INT PRIMARY KEY,
  partner_name VARCHAR(255),
  contract_number VARCHAR(100),
  total_funding DECIMAL(12,2),
  start_date DATE,
  end_date DATE,
  CONSTRAINT fk_ext_h_item FOREIGN KEY (id) REFERENCES research_items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ext_academic_papers (
  id INT PRIMARY KEY,
  journal_name VARCHAR(200),
  impact_factor FLOAT,
  publish_date DATE,
  volume_issue VARCHAR(50),
  is_sci TINYINT(1) DEFAULT 0,
  CONSTRAINT fk_ext_paper_item FOREIGN KEY (id) REFERENCES research_items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ext_patents (
  id INT PRIMARY KEY,
  patent_number VARCHAR(100),
  grant_date DATE,
  inventor VARCHAR(255),
  patent_type VARCHAR(50),
  assignee VARCHAR(255),
  CONSTRAINT fk_ext_patent_item FOREIGN KEY (id) REFERENCES research_items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ext_academic_books (
  id INT PRIMARY KEY,
  publisher VARCHAR(255),
  isbn VARCHAR(20),
  publish_date DATE,
  pages INT,
  CONSTRAINT fk_ext_book_item FOREIGN KEY (id) REFERENCES research_items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ext_awards (
  id INT PRIMARY KEY,
  awarding_body VARCHAR(255),
  award_level VARCHAR(100),
  award_year INT,
  certificate_no VARCHAR(100),
  CONSTRAINT fk_ext_award_item FOREIGN KEY (id) REFERENCES research_items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NULL,
  action VARCHAR(255) NOT NULL,
  target_type VARCHAR(100),
  target_id INT NULL,
  old_value JSON,
  new_value JSON,
  ip VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_user (user_id),
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS notices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  content VARCHAR(2000) NOT NULL,
  target_role VARCHAR(50) NOT NULL,
  target_dept_id INT NULL,
  publisher VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notice_dept (target_dept_id),
  CONSTRAINT fk_notice_dept FOREIGN KEY (target_dept_id) REFERENCES departments(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS notice_recipients (
  id INT PRIMARY KEY AUTO_INCREMENT,
  notice_id INT NOT NULL,
  user_id INT NOT NULL,
  is_read TINYINT(1) DEFAULT 0,
  read_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_nr_notice (notice_id),
  INDEX idx_nr_user (user_id),
  CONSTRAINT fk_nr_notice FOREIGN KEY (notice_id) REFERENCES notices(id),
  CONSTRAINT fk_nr_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS review_templates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_shared TINYINT(1) DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS permissions_catalog (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  module VARCHAR(100) NOT NULL,
  description VARCHAR(255),
  enabled TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255),
  is_system TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS role_permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  role_id INT NOT NULL,
  code VARCHAR(100) NOT NULL,
  INDEX idx_rp_role (role_id),
  CONSTRAINT fk_rp_role FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS user_experiences (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  type VARCHAR(20) NOT NULL,
  start_date DATE,
  end_date DATE,
  title VARCHAR(255),
  institution VARCHAR(255),
  description VARCHAR(2000),
  order_index INT,
  INDEX idx_ue_user (user_id),
  CONSTRAINT fk_ue_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

