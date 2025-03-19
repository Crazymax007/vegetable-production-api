const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  const token = req.cookies.token; // ดึง Token จาก Cookie
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // บันทึกข้อมูลผู้ใช้ใน req
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

exports.verifyRole = (requiredRoles) => (req, res, next) => {
  if (!req.user || !requiredRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden: Access denied" });
  }
  next();
};
