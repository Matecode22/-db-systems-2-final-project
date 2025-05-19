// Tipos para las entidades de PostgreSQL

export interface Area {
  code: number
  name: string
  faculty_code: number
  coordinator_id: string
}

export interface Subject {
  code: string
  name: string
  program_code: number
}

export interface City {
  code: number
  name: string
  dept_code: number
}

export interface Department {
  code: number
  name: string
  country_code: number
}

export interface Employee {
  id: string
  first_name: string
  last_name: string
  email: string
  contract_type: string
  employee_type: string
  faculty_code: number
  campus_code: number
  birth_place_code: number
}

export interface Faculty {
  code: number
  name: string
  location: string
  phone_number: string
  dean_id: string | null
}

export interface Group {
  number: number
  semester: string
  subject_code: string
  professor_id: string
}

export interface Country {
  code: number
  name: string
}

export interface Program {
  code: number
  name: string
  area_code: number
}

export interface Campus {
  code: number
  name: string | null
  city_code: number
}

export interface ContractType {
  name: string
}

export interface EmployeeType {
  name: string
}
