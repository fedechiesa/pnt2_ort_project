import { expect } from "chai";
import supertest from "supertest";

const request = supertest("http://localhost:3001");

describe("*** TEST DEL SERVICIO API ALUMNOS (ext) ***", () => {
  let tokenEntrenador = "";
  let idEntrenador = null;

  before(async () => {
    const loginResp = await request.post("/api/auth/login").send({
      email: "entrenador@test.com",
      password: "123456",
    });

    expect(loginResp.status).to.eql(200);
    tokenEntrenador = loginResp.body.token;
    idEntrenador = loginResp.body.user.id;
  });

  describe("GET /api/alumnos sin token", () => {
    it("debería devolver 401 si no se envía token", async () => {
      const response = await request.get("/api/alumnos");
      expect(response.status).to.eql(401);
    });
  });

  describe("GET /api/alumnos con token", () => {
    it("debería devolver el listado de alumnos del entrenador", async () => {
      const response = await request
        .get("/api/alumnos")
        .set("Authorization", `Bearer ${tokenEntrenador}`);

      expect(response.status).to.eql(200);
      expect(response.body).to.be.an("array");

      if (response.body.length > 0) {
        const alumno = response.body[0];
        expect(alumno).to.include.keys("id", "nombre", "apellido");
      }
    });
  });

  describe("GET /api/entrenadores/:id/calendario", () => {
    it("debería devolver los eventos del calendario del entrenador", async () => {
      const response = await request
        .get(`/api/entrenadores/${idEntrenador}/calendario`)
        .set("Authorization", `Bearer ${tokenEntrenador}`);

      expect(response.status).to.eql(200);
      expect(response.body).to.be.an("array");

      if (response.body.length > 0) {
        const evento = response.body[0];
        expect(evento).to.include.keys(
          "title",
          "start",
          "end",
          "alumno",
          "rutina"
        );
      }
    });
  });
});
