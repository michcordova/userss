import express from "express";
import { createUser, getUsers, updateUser, deleteUser, login } from "../controllers/userController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: The users managing API
 * /api/users/all:
 *  get:
 *   summary: Get all Users
 *   tags: [Users]
 *   responses:
 *     '200':
 *        description: A successful response
 */
router.get('/all', getUsers);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: The users managing API
 * /api/users/createuser:
 *  post:
 *   summary: Create Users
 *   tags: [Users]
 *   requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the user
 *               email:
 *                 type: string
 *                 description: Email of the user
 *               password:
 *                 type: string
 *                 description: Password for the user
 *   responses:
 *     '200':
 *        description: A successful response
 */
router.post('/createuser/', createUser);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: The users managing API
 * /api/users/updateuser/{id}:
 *  patch:
 *   summary: Modifies Users
 *   tags: [Users]
 *   parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user to delete
 *         schema:
 *           type: string
 *   responses:
 *     '200':
 *        description: A successful response
 */
router.patch('/updateuser/:id', updateUser);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: The users managing API
 * /api/users/deleteuser/{id}:
 *  patch:
 *   summary: Deletes Users
 *   tags: [Users]
 *   parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user to delete
 *         schema:
 *           type: string
 *   responses:
 *     '200':
 *        description: A successful response
 */
router.patch('/deleteuser/:id', deleteUser);

router.post('/login', login)

export default router;