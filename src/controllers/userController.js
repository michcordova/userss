import Users from "../models/userModel.js";
import { userCreatedEvent } from "../services/rabbitServicesEvent.js";
import jwt from 'jsonwebtoken';

export const createUser = async (req, res) => {
    const { password, username, phone } = req.body;

    // Validar que los campos obligatorios estén presentes
    if (!phone || !username || !password) {
        return res.status(400).json({ mensaje: 'Teléfono, correo y contraseña son obligatorios' });
    }

    // Validar formato de correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(username)) {
        return res.status(400).json({ mensaje: 'El correo no tiene un formato válido' });
    }

    // Validar que el teléfono tenga al menos 10 dígitos numéricos
    const phoneRegex = /^\d{10,}$/;
    if (!phoneRegex.test(phone)) {
        return res.status(400).json({ mensaje: 'El teléfono debe contener al menos 10 dígitos' });
    }

    // Validar que la contraseña tenga al menos 8 caracteres
    if (password.length < 8) {
        return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 8 caracteres' });
    }

    try {
        // Verificar si el usuario ya existe
        const existingUser = await Users.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ mensaje: 'El nombre de usuario ya existe' });
        }

        // Crear nuevo usuario
        const newUser = await Users.create({
            phone,
            username,
            password,
            status: true,
            creationDate: new Date(),
        });

        console.log(newUser);
        await userCreatedEvent(newUser);

        res.status(201).json({ message: 'Usuario creado', data: newUser });
    } catch (error) {
        console.error('Error al crear el usuario: ', error);
        res.status(500).json({ message: 'Error al crear el usuario' });
    }
};

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { password, phone } = req.body;

    try {
        const user = await Users.findByPk(id);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Validar que la contraseña tenga al menos 8 caracteres
        if (password.length < 8) {
            return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 8 caracteres' });
        }

        // Validar que el teléfono tenga al menos 10 dígitos numéricos
        const phoneRegex = /^\d{10,}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ mensaje: 'El teléfono debe contener al menos 10 dígitos' });
        }

        // Verificar si el teléfono ya está registrado en otro usuario
        if (phone) {
            const existingUser = await Users.findOne({ where: { phone } });
            if (existingUser && existingUser.id !== Number(id)) {
                return res.status(400).json({ message: 'El teléfono ya está registrado en otro usuario' });
            }
        }

        await user.update({
            phone: phone || user.phone,
            password: password || user.password,
        });

        return res.status(200).json({ message: 'Usuario actualizado ', data:user })
    } catch (error) {
        console.error('Error al listar usuarios: ', error);
        res.status(500)
            .json({ message: 'Error al obtener los usuarios' });
    }
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        // Verificar si el usuario existe
        const user = await Users.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Verificar si el usuario ya está desactivado
        if (!user.status) {
            return res.status(400).json({ message: "El usuario ya está desactivado." });
        }

        // Cambiar el estado del usuario en lugar de eliminarlo
        await user.update({ status: false });

        return res.status(200).json({ message: 'Usuario deshabilitado correctamente', data: user });
    } catch (error) {
        console.error('Error al deshabilitar usuario: ', error);
        return res.status(500).json({ message: 'Error al deshabilitar usuario' });
    }
};

export const activateUser = async (req, res) => {
    const { id } = req.params;

    try {
        // Verificar si el usuario existe
        const user = await Users.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Verificar si el usuario ya está activo
        if (user.status) {
            return res.status(400).json({ message: 'El usuario ya está activo' });
        }

        // Activar el usuario cambiando su estado a "true"
        await user.update({ status: true });

        return res.status(200).json({ message: 'Usuario activado correctamente', data: user });
    } catch (error) {
        console.error('Error al activar usuario: ', error);
        return res.status(500).json({ message: 'Error al activar usuario' });
    }
};

export const getUsers = async (req, res) => {
    try {
        const users = await Users.findAll(); // SELECT *FROM users
        res.status(200).json(users);
    } catch (error) {
        console.error('Error al listar usuarios: ', error);
        res.status(500)
            .json({ message: 'Error al obtener los usuarios' });
    }
};

export const login = async (req, res) => {
    const { username, password } = req.body;
    const SECRET_KEY = "aJksd9QzPl+sVdK7vYc/L4dK8HgQmPpQ5K9yApUsj3w="; // Considera mover esto a una variable de entorno

    try {
        // Verificar si el usuario existe
        const user = await Users.findOne({ where: { username } });
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Verificar la contraseña en texto plano (no recomendado)
        if (password !== user.password) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        // Generar el token
        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });

        return res.status(200).json({ message: 'Inicio de sesión exitoso', token });
    } catch (error) {
        console.error('Error al iniciar sesión: ', error);
        return res.status(500).json({ message: 'Error en el servidor' });
    }
};

export async function createUserFromClient(clientData) {
    const { id, name, lastName, email, phone, password } = clientData;

    const existingUser = await Users.findOne({ where: { username: email } });
    if (existingUser) {
        console.log("Usuario ya existe: ", email);
        return;
    }

    const newUser = await Users.create({
        username: email,
        password,
        phone,
        status: true,
        creationDate: new Date(),
    });

    console.log("Usuario creado:", newUser.username);
}
