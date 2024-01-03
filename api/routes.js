const express = require("express");
const router = express.Router();

// Models
const User = require("../models/user.model");
const School = require("../models/school.model");
const Class = require("../models/class.model");
const Student = require("../models/student.model");

// Authentication Middleware
const authenticate = require("../middleware/authenticate");

// 1. Signup
router.post("/signup", async (req, res) => {
  const { name, email, password, photo, role } = req.body;

  if (!name || !email || !password || !photo || !role) {
    return res.status(400).json({
      error: "Missing required fields",
    });
  }

  try {
    const userExist = await User.findOne({ email: email });

    if (userExist) {
      return res.status(422).json({ err: "Email already exist" });
    }

    const user = new User({ name, email, password, photo, role });

    await user.save();

    res.status(201).json({ message: "user successfully registered" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});

// 2. Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Please fill require data" });
  }

  try {
    let token;
    const user = await User.findOne({ email: email });

    if (user) {
      token = await user.generateAuthToken();

      res.header("token", `${token}`);

      if (user.password === password) {
        res.json({ message: "Login successful" });
      } else {
        res.status(400).json({ err: "Invalid Credentials" });
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});

// 3. Create School
router.post("/create-school", authenticate, async (req, res) => {
  const { name, photo } = req.body;

  if (!name || !photo) {
    return res.status(400).json({
      error: "Missing required fields",
    });
  }

  try {
    const userId = req.currentUser._id;

    const school = new School({ name, photo, userId });

    await school.save();

    res.status(201).json({ message: "School created successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});

// 4. Get Schools
router.get("/get-schools", authenticate, async (req, res) => {
  try {
    const userId = req.currentUser._id;
    const userRole = req.currentUser.role;

    const schools = await School.find({ userId });

    res.status(200).json({ schools, userRole });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});

// 5. Create Class
router.post("/create-class", authenticate, async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({
      error: "Missing required fields",
    });
  }

  try {
    const newClass = new Class({
      name,
    });

    await newClass.save();

    res.status(201).json({ message: "Class created successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});

// 6. Get Class
router.get("/get-classes", authenticate, async (req, res) => {
  try {
    const classes = await Class.find({});

    res.status(200).json({ classes });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});

// 7. Create Student
router.post("/create-student", authenticate, async (req, res) => {
  const { name, photo } = req.body;

  if (!name || !photo) {
    return res.status(400).json({
      error: "Missing required fields",
    });
  }

  try {
    const student = new Student({ name, photo });

    await student.save();

    res.status(201).json({ message: "Student created successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});

// 8. Get Students
router.get("/get-students", authenticate, async (req, res) => {
  try {
    const students = await Student.find({});

    res.status(200).json({ students });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});

// 9. Assign Student to Class
router.post("/assign-student", authenticate, async (req, res) => {
  const { classId, studentId } = req.body;

  if (!classId || !studentId) {
    return res.status(400).json({
      error: "Missing required fields",
    });
  }

  try {
    const selectedClass = await Class.findById(classId);
    const student = await Student.findById(studentId);

    if (!selectedClass || !student) {
      return res.status(404).json({
        error: "Class or student not found",
      });
    }

    const studentName = student.name;

    selectedClass.students.push({
      studentId,
      studentName,
    });
    await selectedClass.save();

    res
      .status(201)
      .json({ message: "Student assigned to the class successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});

// 10. Get Students in All Classes
router.get("/get-students-in-all-classes", authenticate, async (req, res) => {
  try {
    const allClasses = await Class.find({});
    const allStudents = await Student.find({});

    const studentsInAllClasses = [];

    for (let student of allStudents) {
      const foundClasses = await Class.find({
        students: {
          $elemMatch: {
            studentId: student._id,
          },
        },
      });

      if (foundClasses.length === allClasses.length) {
        studentsInAllClasses.push(student.name);
      }
    }
    res.status(200).json({ studentsInAllClasses });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});

// 11. Get Classmates of Specific Student
router.get("/get-classmates", authenticate, async (req, res) => {
  const { studentId } = req.query;

  try {
    const studentClasses = await Class.find({
      students: {
        $elemMatch: {
          studentId: studentId,
        },
      },
    });

    const classIds = studentClasses.map((classObj) => classObj._id);

    const classmates = await Student.find({
      _id: { $ne: studentId },
    });

    const classmatesList = [];

    for (let std of classmates) {
      let s = await Student.findOne({ _id: std._id });

      if (s) {
        const classes = await Class.find({ "students.studentId": s._id });
        const otherStudentClassIds = classes.map((classObj) => classObj._id);

        let check = classIds.every((id) => otherStudentClassIds.map(String).includes(String(id)));

        if (check) {
          classmatesList.push(s.name);
        }
      }
    }

    res.status(200).json({ classmatesList });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});

module.exports = router;
