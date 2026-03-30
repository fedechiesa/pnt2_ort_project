import { Op } from "sequelize";
import AlumnosModel from "./alumnosModel.js";

class AlumnosRepo {
  #alumnosModel = null;
  #ready = null;

  constructor() {
    this.#alumnosModel = AlumnosModel.init();
    this.#ready = AlumnosModel.sync();
  }

  #ensureReady = async () => {
    await this.#ready;
  };

  crear = async (alumno) => {
    await this.#ensureReady();
    const created = await this.#alumnosModel.create(alumno);
    return created.get({ plain: true });
  };

  listar = async () => {
    await this.#ensureReady();
    const rows = await this.#alumnosModel.findAll({ order: [["id", "ASC"]] });
    return rows.map((r) => r.get({ plain: true }));
  };

  listarPorEntrenador = async (entrenadorId) => {
    await this.#ensureReady();
    const where = entrenadorId ? { entrenadorId } : {};
    const rows = await this.#alumnosModel.findAll({
      where,
      order: [["id", "ASC"]],
    });
    return rows.map((r) => r.get({ plain: true }));
  };

  asignarEntrenador = async (alumnoId, entrenadorId) => {
    await this.#ensureReady();
    await this.#alumnosModel.update(
      { entrenadorId },
      { where: { id: alumnoId } }
    );
    const updated = await this.#alumnosModel.findByPk(alumnoId);
    return updated ? updated.get({ plain: true }) : null;
  };

  desasignarEntrenador = async (alumnoId) => {
    await this.#ensureReady();
    await this.#alumnosModel.update(
      { entrenadorId: null },
      { where: { id: alumnoId } }
    );
    const updated = await this.#alumnosModel.findByPk(alumnoId);
    return updated ? updated.get({ plain: true }) : null;
  };

  asignarPlan = async (alumnoId, planId) => {
    await this.#ensureReady();
    await this.#alumnosModel.update({ planId }, { where: { id: alumnoId } });
    const updated = await this.#alumnosModel.findByPk(alumnoId);
    return updated ? updated.get({ plain: true }) : null;
  };

  desasignarPorPlan = async (planId) => {
    await this.#ensureReady();
    await this.#alumnosModel.update({ planId: null }, { where: { planId } });
  };

  seedDesdeUsuarios = async (usuarios) => {
    await this.#ensureReady();
    if (!Array.isArray(usuarios) || !usuarios.length) return;

    const emails = usuarios.map((u) => u.email.toLowerCase());
    const existentes = await this.#alumnosModel.findAll({
      where: { email: { [Op.in]: emails } },
    });
    const existentesMap = new Set(existentes.map((e) => e.email.toLowerCase()));

    const nuevos = usuarios
      .filter((u) => !existentesMap.has(u.email.toLowerCase()))
      .map((u) => ({
        nombre: u.nombre,
        email: u.email.toLowerCase(),
        objetivo: "",
        estado: "activo",
        entrenadorId: null,
        avatarUrl: null,
        planId: null,
        peso: null,
        altura: null,
      }));

    if (nuevos.length) {
      await this.#alumnosModel.bulkCreate(nuevos, { ignoreDuplicates: true });
    }
  };

  buscarPorEmail = async (email) => {
    await this.#ensureReady();
    const alumno = await this.#alumnosModel.findOne({ where: { email } });
    return alumno ? alumno.get({ plain: true }) : null;
  };

  actualizarPorEmail = async (email, datos) => {
    await this.#ensureReady();
    await this.#alumnosModel.update(datos, { where: { email } });
    const updated = await this.#alumnosModel.findOne({ where: { email } });
    return updated ? updated.get({ plain: true }) : null;
  };

  obtenerPorId = async (alumnoId) => {
    await this.#ensureReady();
    const alumno = await this.#alumnosModel.findByPk(alumnoId);
    return alumno ? alumno.get({ plain: true }) : null;
  };
}

export default AlumnosRepo;
