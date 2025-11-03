// Mock data for RFID Attendance System
// TODO: Replace with real API calls to /api/students, /api/courses, /api/attendance

export const mockStudents = [
  {
    id: 1,
    name: "Samuel Excellence",
    regNo: "20201205652",
    rfidTag: "A1B2C3D4",
    department: "Information Technology",
    level: "400L",
    photo: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    id: 2,
    name: "Blessing Chioma",
    regNo: "20201205653",
    rfidTag: "B2C3D4E5",
    department: "Computer Science",
    level: "300L",
    photo: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    id: 3,
    name: "Ibrahim Musa",
    regNo: "20201205654",
    rfidTag: "C3D4E5F6",
    department: "Information Technology",
    level: "400L",
    photo: "https://randomuser.me/api/portraits/men/22.jpg"
  },
  {
    id: 4,
    name: "Grace Adeola",
    regNo: "20201205655",
    rfidTag: "D4E5F6G7",
    department: "Software Engineering",
    level: "200L",
    photo: "https://randomuser.me/api/portraits/women/68.jpg"
  },
  {
    id: 5,
    name: "Chukwudi Okafor",
    regNo: "20201205656",
    rfidTag: "E5F6G7H8",
    department: "Computer Science",
    level: "300L",
    photo: "https://randomuser.me/api/portraits/men/46.jpg"
  },
  {
    id: 6,
    name: "Fatima Abubakar",
    regNo: "20201205657",
    rfidTag: "F6G7H8I9",
    department: "Information Technology",
    level: "400L",
    photo: "https://randomuser.me/api/portraits/women/90.jpg"
  },
  {
    id: 7,
    name: "Daniel Adeleke",
    regNo: "20201205658",
    rfidTag: "G7H8I9J0",
    department: "Software Engineering",
    level: "200L",
    photo: "https://randomuser.me/api/portraits/men/52.jpg"
  },
  {
    id: 8,
    name: "Aisha Mohammed",
    regNo: "20201205659",
    rfidTag: "H8I9J0K1",
    department: "Computer Science",
    level: "300L",
    photo: "https://randomuser.me/api/portraits/women/26.jpg"
  },
  {
    id: 9,
    name: "Emmanuel Okoro",
    regNo: "20201205660",
    rfidTag: "I9J0K1L2",
    department: "Information Technology",
    level: "400L",
    photo: "https://randomuser.me/api/portraits/men/78.jpg"
  },
  {
    id: 10,
    name: "Zainab Hassan",
    regNo: "20201205661",
    rfidTag: "J0K1L2M3",
    department: "Software Engineering",
    level: "200L",
    photo: "https://randomuser.me/api/portraits/women/65.jpg"
  }
];

export const mockCourses = [
  {
    id: 1,
    code: "CSC401",
    title: "Advanced Database Systems",
    lecturer: "Dr. Adebayo Johnson",
    department: "Computer Science",
    level: "400L"
  },
  {
    id: 2,
    code: "SWE301",
    title: "Software Engineering Principles",
    lecturer: "Prof. Grace Nwosu",
    department: "Software Engineering",
    level: "300L"
  },
  {
    id: 3,
    code: "IT402",
    title: "Network Security",
    lecturer: "Dr. Mohammed Bello",
    department: "Information Technology",
    level: "400L"
  },
  {
    id: 4,
    code: "CSC302",
    title: "Data Structures & Algorithms",
    lecturer: "Dr. Chinwe Okonkwo",
    department: "Computer Science",
    level: "300L"
  },
  {
    id: 5,
    code: "SWE201",
    title: "Introduction to Programming",
    lecturer: "Mr. Tunde Balogun",
    department: "Software Engineering",
    level: "200L"
  }
];

export const mockUsers = [
  {
    id: 1,
    email: "admin@rfid.edu",
    password: "admin123",
    role: "admin",
    name: "System Administrator"
  },
  {
    id: 2,
    email: "lecturer@rfid.edu",
    password: "lecturer123",
    role: "lecturer",
    name: "Dr. Adebayo Johnson"
  }
];

// Helper to get initial attendance records (empty)
export const getInitialAttendance = () => [];
