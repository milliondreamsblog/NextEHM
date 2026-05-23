import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import multer, { StorageEngine } from "multer";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;

interface CustomRequest extends Request {
  adminId?: string;
}

// ✅ Admin Authentication Middleware
function AdminMiddleware(req: CustomRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Token missing" });
  }
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;
  try {
    const decode = jwt.verify(token, JWT_SECRET) as { id: string };
    req.adminId = decode.id;
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired, please log in again" });
    }
    return res.status(403).json({ message: "Invalid token" });
  }
}

// ✅ Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Custom Multer StorageEngine using cloudinary v2 upload_stream directly.
// multer-storage-cloudinary (all versions) requires cloudinary v1 as a peer dep
// and is incompatible with cloudinary v2. This inline engine replaces it.
const cloudinaryStorage: StorageEngine = {
  _handleFile(req: any, file: any, cb: any) {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "EHM-APP", allowed_formats: ["jpg", "png", "jpeg", "gif", "webp"] },
      (error: any, result: any) => {
        if (error) return cb(error);
        // path = secure_url, filename = public_id — matches existing route handlers
        cb(null, {
          path: result.secure_url,
          filename: result.public_id,
          size: result.bytes,
        });
      }
    );
    file.stream.pipe(uploadStream);
  },
  _removeFile(req: any, file: any, cb: any) {
    cloudinary.uploader.destroy(file.filename, cb);
  },
};

const upload = multer({
  storage: cloudinaryStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB (increased from 5MB)
});

export { AdminMiddleware, upload };
