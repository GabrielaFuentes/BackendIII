//Instalan: npm i @faker-js/faker
import { faker } from "@faker-js/faker";
import { createHash } from "../utils/index.js";

class MockingService {
    async generateMockingUsers(num) {

    }

    static async generateMockingPets(num) {
        const pets = [];

        for (let i = 0; i < num; i++) {
            pets.push({
                name: faker.animal.dog(),
                specie: faker.animal.type(),
                adopted: false
            })
        }
        console.log(pets);
        return pets;
    }

    static async generateMockingUsers(num) {
        const users = [];
        for (let i = 0; i < num; i++) {
            users.push({
                first_name: faker.person.firstName(),
                last_name: faker.person.lastName(),
                email: faker.internet.email(),
                password: await createHash("coder123"),
                role: faker.helpers.arrayElement(["user", "admin"]),
                pets: []
            })
        }
        return users;
    }
}

export default MockingService; 