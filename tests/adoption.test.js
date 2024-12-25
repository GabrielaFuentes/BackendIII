import supertest from 'supertest';
import app from '../src/app.js';
import mongoose from 'mongoose';
import Adoption from '../src/dao/models/Adoption.js';
import User from '../src/dao/models/User.js';
import Pet from '../src/dao/models/Pet.js';
import should from 'should'; // Asegúrate de importar should

const request = supertest(app);

describe("Adoption Router Functional Tests", function () {
    let testUser, testPet, testAdoption;

    // Conexión a la base de datos antes de las pruebas
    before(async function () {
        this.timeout(6000);  // Aumenta el tiempo de espera si es necesario
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    });

    // Configuración previa a cada prueba
    beforeEach(async function () {
        await Adoption.deleteMany({});
        await User.deleteMany({});
        await Pet.deleteMany({});

        // Crear un usuario de prueba
        testUser = await User.create({
            first_name: "Test",
            last_name: "User",
            email: "test@example.com",
            password: "password123"
        });

        // Crear una mascota de prueba
        testPet = await Pet.create({
            name: "TestPet",
            specie: "Dog",
            birthDate: new Date(),
            adopted: false
        });

        // Crear una adopción de prueba
        testAdoption = await Adoption.create({
            owner: testUser._id,
            pet: testPet._id
        });
    });

    // Prueba para obtener todas las adopciones
    describe("GET /api/adoptions", function () {
        it("should return all adoptions", async function () {
            const response = await request.get('/api/adoptions');
            console.log(response.body); // Verifica la respuesta

            // Asegúrate de que response.body no sea undefined
            should.exist(response);
            should.exist(response.body);

            response.status.should.equal(200);
            response.body.status.should.equal('success');
            Array.isArray(response.body.payload).should.be.true;
            response.body.payload.length.should.be.greaterThan(0);
        });
    });


    // Prueba para obtener adopciones por ID
    describe("GET /api/adoptions/:id", function () {
        it("should return a specific adoption", async function () {
            const response = await request.get(`/api/adoptions/${testAdoption._id}`);
            should.exist(response);
            response.status.should.equal(200);
            response.body.status.should.equal('success');
            response.body.payload._id.should.equal(testAdoption._id.toString());
        });
    });

    // Prueba para crear una nueva adopción
    describe("POST /api/adoptions", function () {
        it("should create a new adoption", async function () {
            // Asegúrate de que tienes esta ruta definida
            app.post('/api/adoptions', async (req, res) => {
                try {
                    const { owner, pet } = req.body;
                    if (!owner || !pet) {
                        return res.status(400).json({ status: 'fail', message: 'Missing data' });
                    }

                    const newAdoption = new Adoption({ owner, pet });
                    await newAdoption.save();

                    res.status(201).json({ status: 'success', payload: newAdoption });
                } catch (error) {
                    res.status(500).json({ status: 'fail', message: error.message });
                }
            });

            const response = await request
                .post('/api/adoptions')
                .send({
                    owner: testUser._id,
                    pet: testPet._id
                });

            response.status.should.equal(201);
            response.body.status.should.equal('success');
            response.body.payload.should.have.property('_id');
            response.body.payload.owner.should.equal(testUser._id.toString());
        });

        it("should return 400 for missing data", async function () {
            const response = await request.post('/api/adoptions').send({});
            response.status.should.equal(400);
            response.body.status.should.equal('fail');
        });
    });
    describe("POST /api/adoptions/:uid/:pid", function () {
        it("should create a new adoption", async function () {
            const newPet = await Pet.create({
                name: "NewPet",
                specie: "Cat",
                birthDate: new Date(),
                adopted: false
            });

            const response = await request
                .post(`/api/adoptions/${testUser._id}/${newPet._id}`)
                .expect(200);

            response.body.should.have.property('status', 'success');
            response.body.should.have.property('message', 'Pet adopted');

            const updatedPet = await Pet.findById(newPet._id);
            updatedPet.adopted.should.be.true();
        });

        it("should return 404 for non-existent user", async function () {
            const fakeUserId = new mongoose.Types.ObjectId();
            const response = await request
                .post(`/api/adoptions/${fakeUserId}/${testPet._id}`)
                .expect(404);

            response.body.should.have.property('status', 'error');
            response.body.should.have.property('error', 'user Not found');
        });

        it("should return 404 for non-existent pet", async function () {
            const fakePetId = new mongoose.Types.ObjectId();
            const response = await request
                .post(`/api/adoptions/${testUser._id}/${fakePetId}`)
                .expect(404);

            response.body.should.have.property('status', 'error');
            response.body.should.have.property('error', 'Pet not found');
        });

        it("should return 400 for already adopted pet", async function () {
            const adoptedPet = await Pet.create({
                name: "AdoptedPet",
                specie: "Dog",
                birthDate: new Date(),
                adopted: true
            });

            const response = await request
                .post(`/api/adoptions/${testUser._id}/${adoptedPet._id}`)
                .expect(400);

            response.body.should.have.property('status', 'error');
            response.body.should.have.property('error', 'Pet is already adopted');
        });
    });

    // Desconexión de la base de datos después de todas las pruebas
    after(async function () {
        await mongoose.disconnect();
    });
});