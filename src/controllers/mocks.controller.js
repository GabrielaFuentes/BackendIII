import MockingService from "../services/mocking.js";
import UserDAO from "../dao/Users.dao.js";
import PetDAO from "../dao/Pets.dao.js";

const userDAO = new UserDAO();
const petDAO = new PetDAO();

const mocksController = {
    // Generar usuarios mock (no persiste en la base de datos)
    getMockingUsers: async (req, res) => {
        try {
            const users = await MockingService.generateMockingUsers(50); // Solo genera datos
            res.json({ status: "success", message: "Usuarios mock generados", payload: users });
        } catch (error) {
            res.status(500).json({ status: "error", message: "Error al generar usuarios mock" });
        }
    },

    // Generar mascotas mock (no persiste en la base de datos)
    getMockingPets: async (req, res) => {
        try {
            const pets = await MockingService.generateMockingPets(100); // Solo genera datos
            res.json({ status: "success", message: "Mascotas mock generadas", payload: pets });
        } catch (error) {
            res.status(500).json({ status: "error", message: "Error al generar mascotas mock" });
        }
    },

    // Generar y guardar datos en la base de datos
    generateData: async (req, res) => {
        const { users: numUsers, pets: numPets } = req.body;

        if (!numUsers || !numPets || numUsers <= 0 || numPets <= 0) {
            return res.status(400).json({
                status: "error",
                message: "Debes proporcionar un número válido de usuarios y mascotas.",
            });
        }

        try {
            // Generar datos
            const users = await MockingService.generateMockingUsers(numUsers);
            const pets = await MockingService.generateMockingPets(numPets);

            // Guardar en la base de datos
            const savedUsers = await Promise.all(users.map(user => userDAO.save(user)));
            const savedPets = await Promise.all(pets.map(pet => petDAO.save(pet)));

            res.json({
                status: "success",
                message: "Datos generados y guardados correctamente.",
                payload: {
                    users: savedUsers.length,
                    pets: savedPets.length,
                },
            });
        } catch (error) {
            console.error("Error al generar o guardar datos:", error);
            res.status(500).json({ status: "error", message: "Error al generar y guardar datos" });
        }
    },
};

export default mocksController;
