import { expect } from "chai";
import { generarAsignacionPorDefecto } from "../../modelo/plan.js";

const buildRutinas = (cantidad) =>
  Array.from({ length: cantidad }, (_, idx) => ({ id: `r${idx + 1}`, nombre: `Rutina ${idx + 1}` }));

describe("generarAsignacionPorDefecto", () => {
  it("usa lun-mie-vie cuando hay 3 rutinas", () => {
    const asignacion = generarAsignacionPorDefecto(buildRutinas(3));
    expect(asignacion).to.have.length(3);
    expect(asignacion.map((a) => a.dias[0])).to.deep.equal(["lun", "mie", "vie"]);
    expect(asignacion.map((a) => a.orden)).to.deep.equal([1, 2, 3]);
  });

  it("usa lun-mar-jue-vie cuando hay 4 rutinas", () => {
    const asignacion = generarAsignacionPorDefecto(buildRutinas(4));
    expect(asignacion.map((a) => a.dias[0])).to.deep.equal(["lun", "mar", "jue", "vie"]);
  });

  it("reparte de lun a sab para 5+ rutinas", () => {
    const asignacion5 = generarAsignacionPorDefecto(buildRutinas(5));
    expect(asignacion5.map((a) => a.dias[0])).to.deep.equal(["lun", "mar", "mie", "jue", "vie"]);

    const asignacion7 = generarAsignacionPorDefecto(buildRutinas(7));
    expect(asignacion7.map((a) => a.dias[0]).slice(0, 6)).to.deep.equal(["lun", "mar", "mie", "jue", "vie", "sab"]);
  });

  it("devuelve arreglo vacío si no hay rutinas", () => {
    expect(generarAsignacionPorDefecto([])).to.deep.equal([]);
  });
});
