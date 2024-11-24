const gradingScales = {
  sevenpointscale: { AA: 93, BB: 85, CC: 77, DD: 69 },
  tenpointscale: { AA: 90, BB: 80, CC: 70, DD: 60 },
};

// Student class to store student information and calculate grade
class Student {
  constructor(id, name, midtermScore, finalScore) {
    this.id = id;
    this.name = name;
    this.midtermScore = midtermScore;
    this.finalScore = finalScore;
    this.grade = null;
  }

  // This function calculates the student's grade based on the score
  calculateGrade(scale) {
    const score = this.midtermScore * 0.4 + this.finalScore * 0.6;
    return score >= scale.AA
      ? "AA"
      : score >= scale.BB
      ? "BB"
      : score >= scale.CC
      ? "CC"
      : score >= scale.DD
      ? "DD"
      : "FF";
  }
}

// Course class to handle students and grading scale for each course
class Course {
  constructor(name, gradingScale) {
    this.name = name;
    this.gradingScale = gradingScale;
    this.students = [];
  }

  // This function adds a student to the course and calculates their grade
  addStudent(student) {
    student.grade = student.calculateGrade(gradingScales[this.gradingScale]);
    this.students.push(student);
  }

  // This function removes a student from the course by index
  deleteStudent(studentIndex) {
    this.students.splice(studentIndex, 1);
  }

  // This function filters students based on whether they passed or failed
  getFilteredStudents(status) {
    return this.students.filter((student) =>
      status === "passed" ? student.grade !== "FF" : student.grade === "FF"
    );
  }
}

let courses = [];

// When the page loads, we load the courses from localStorage
window.onload = function () {
  loadCoursesFromLocalStorage();
};

// This function loads the courses from localStorage if they exist
function loadCoursesFromLocalStorage() {
  const storedCourses = localStorage.getItem("courses");

  if (storedCourses) {
    courses = JSON.parse(storedCourses);
    updateCourseDropdown();
    updateStudentTableForSelectedCourse();
  }
}

// This function adds a new course to the list and saves it to localStorage
function addCourse() {
  const courseName = document.getElementById("course-name").value;
  const gradingScale = document.getElementById("grading-scale").value;

  if (courseName && gradingScale) {
    const newCourse = new Course(courseName, gradingScale);
    courses.push(newCourse);
    localStorage.setItem("courses", JSON.stringify(courses));
    updateCourseDropdown();
    alert(`Course "${courseName}" with "${gradingScale}" scale added!`);
    document.getElementById("course-name").value = "";
  } else {
    alert("Please enter the course name and select the grading scale.");
  }
}

// This function updates the dropdown lists of courses
function updateCourseDropdown() {
  const courseSelect = document.getElementById("course-select");
  const courseSelectForStudents = document.getElementById(
    "course-select-for-students"
  );

  courseSelect.innerHTML = "";
  courseSelectForStudents.innerHTML = "";

  courses.forEach((course, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = course.name;
    courseSelect.appendChild(option);

    const optionForList = document.createElement("option");
    optionForList.value = index;
    optionForList.textContent = course.name;
    courseSelectForStudents.appendChild(optionForList);
  });
}

// This function shows the selected section and hides the others
function showSection(sectionId) {
  const sections = document.querySelectorAll(".section");
  sections.forEach((section) => {
    section.classList.remove("active");
  });

  const activeSection = document.getElementById(sectionId);
  if (activeSection) {
    activeSection.classList.add("active");
  }
}

// This function adds a new student to the selected course
function addStudent() {
  const courseIndex = document.getElementById("course-select").value;
  const studentID = document.getElementById("student-id").value;
  const studentName = document.getElementById("student-name").value.trim();
  const midtermScore = parseFloat(
    document.getElementById("midterm-score").value
  );
  const finalScore = parseFloat(document.getElementById("final-score").value);

  if (
    courseIndex === "" ||
    studentID === "" ||
    studentName === "" ||
    isNaN(midtermScore) ||
    isNaN(finalScore)
  ) {
    alert("Please fill in all fields correctly.");
    return;
  }

  if (midtermScore < 0 || finalScore < 0) {
    alert("Scores cannot be negative!");
    return;
  }

  if (midtermScore > 100 || finalScore > 100) {
    alert("Scores cannot be bigger than 100!");
    return;
  }

  const course = courses[courseIndex];

  const existingStudent = course.students.find(
    (student) => student.id === studentID
  );

  if (existingStudent) {
    alert("This student is already enrolled in this course.");
    return;
  }

  const newStudent = new Student(
    studentID,
    studentName,
    midtermScore,
    finalScore
  );

  course.addStudent(newStudent);
  localStorage.setItem("courses", JSON.stringify(courses));
  updateStudentTableForSelectedCourse();
  clearStudentForm();
  alert("Student added!");
}

// This function clears the student form after adding a student
function clearStudentForm() {
  document.getElementById("student-id").value = "";
  document.getElementById("student-name").value = "";
  document.getElementById("midterm-score").value = "";
  document.getElementById("final-score").value = "";
}

// This function searches students in the table by their name
function searchInTable() {
  const searchQuery = document
    .getElementById("search-box")
    .value.trim()
    .toLowerCase();
  const courseSelect = document.getElementById("course-select-for-students");
  const courseIndex = courseSelect.value;

  const tableBody = document.querySelector("#student-table tbody");
  tableBody.innerHTML = "";

  if (courseIndex === "") {
    return;
  }

  const course = courses[courseIndex];
  const filteredStudents = course.students.filter((student) =>
    student.name.toLowerCase().includes(searchQuery)
  );

  filteredStudents.forEach((student, studentIndex) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${course.name}</td>
      <td>${student.id}</td>
      <td>${student.name}</td>
      <td>${student.midtermScore}</td>
      <td>${student.finalScore}</td>
      <td>${student.grade}</td>
      <td>
        <button onclick="deleteStudent(${courseIndex}, ${studentIndex})">Delete</button>
        <button onclick="editStudent(${courseIndex}, ${studentIndex})">Edit</button>
      </td>
      <td>${student.grade !== "FF" ? "Passed" : "Failed"}</td>
    `;
    tableBody.appendChild(row);
  });
}

// This function filters students based on passed or failed status
function filterStudents(status) {
  const courseSelect = document.getElementById("course-select-for-students");
  const courseIndex = courseSelect.value;

  const tableBody = document.querySelector("#student-table tbody");
  tableBody.innerHTML = "";

  if (courseIndex === "") {
    return;
  }

  const course = courses[courseIndex];
  let filteredStudents;

  if (status === "passed") {
    // Passed students (grade !== "FF")
    filteredStudents = course.students.filter(
      (student) => student.grade !== "FF"
    );
  } else if (status === "failed") {
    // Failed students (grade === "FF")
    filteredStudents = course.students.filter(
      (student) => student.grade === "FF"
    );
  }

  filteredStudents.forEach((student, studentIndex) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${course.name}</td>
      <td>${student.id}</td>
      <td>${student.name}</td>
      <td>${student.midtermScore}</td>
      <td>${student.finalScore}</td>
      <td>${student.grade}</td>
      <td>
        <button onclick="deleteStudent(${courseIndex}, ${studentIndex})">Delete</button>
        <button onclick="editStudent(${courseIndex}, ${studentIndex})">Edit</button>
      </td>
      <td>${student.grade !== "FF" ? "Passed" : "Failed"}</td>
    `;
    tableBody.appendChild(row);
  });
  // it show passed or failed students
  const passedCount = filteredStudents.filter(
    (student) => student.grade !== "FF"
  ).length;
  const failedCount = filteredStudents.length - passedCount;

  alert(`Passed Students: ${passedCount}, Failed Students: ${failedCount}`);
}

// This function clears search and filter, and reloads the student table
function clearSearchAndFilter() {
  document.getElementById("search-box").value = "";
  const courseSelect = document.getElementById("course-select-for-students");
  const courseIndex = courseSelect.value;
  updateStudentTableForSelectedCourse();
}

// This function updates the student table when a course is selected
function updateStudentTableForSelectedCourse() {
  const courseSelect = document.getElementById("course-select-for-students");
  const courseIndex = courseSelect.value;
  const tableBody = document.querySelector("#student-table tbody");

  tableBody.innerHTML = "";

  if (courseIndex === "") {
    return;
  }

  const course = courses[courseIndex];
  course.students.forEach((student, studentIndex) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${course.name}</td>
      <td>${student.id}</td>
      <td>${student.name}</td>
      <td>${student.midtermScore}</td>
      <td>${student.finalScore}</td>
      <td>${student.grade}</td>
      <td>
        <button onclick="deleteStudent(${courseIndex}, ${studentIndex})">Delete</button>
        <button onclick="editStudent(${courseIndex}, ${studentIndex})">Edit</button>
      </td>
      <td>${student.grade !== "FF" ? "Passed" : "Failed"}</td>
    `;

    tableBody.appendChild(row);
  });
}

// This function deletes a student from the course
function deleteStudent(courseIndex, studentIndex) {
  const course = courses[courseIndex];
  course.deleteStudent(studentIndex);
  localStorage.setItem("courses", JSON.stringify(courses));
  updateStudentTableForSelectedCourse();
  alert("Student deleted successfully!");
}

// This function allows you to edit a student's information
function editStudent(courseIndex, studentIndex) {
  const course = courses[courseIndex];
  const student = course.students[studentIndex];

  document.getElementById("edit-modal").style.display = "block";
  document.getElementById("edit-student-id").value = student.id;
  document.getElementById("edit-student-name").value = student.name;

  const updateButton = document.getElementById("update-student-button");
  updateButton.onclick = function () {
    updateStudent(courseIndex, studentIndex);
  };
}

// This function updates the student's information after editing
function updateStudent(courseIndex, studentIndex) {
  const studentID = document.getElementById("edit-student-id").value;
  const studentName = document.getElementById("edit-student-name").value.trim();

  if (studentID === "" || studentName === "") {
    alert("Please fill in all fields correctly.");
    return;
  }

  const course = courses[courseIndex];
  const student = course.students[studentIndex];

  student.name = studentName;

  localStorage.setItem("courses", JSON.stringify(courses));
  updateStudentTableForSelectedCourse();
  closeModal();

  alert("Student updated!");
}

// This function closes the edit modal
function closeModal() {
  document.getElementById("edit-modal").style.display = "none";
}

// Delete all data from localstorage
function clearLocalStorage() {
  localStorage.clear();
  alert("All data has been cleared!");
}
