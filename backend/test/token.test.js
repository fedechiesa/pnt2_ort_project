import { expect } from 'chai'
import { crearToken, validarToken } from '../servicio/tokenService.js'

describe('*** TEST DEL SERVICIO DE TOKENS ***', () => {
  it('debería crear un token JWT válido a partir de un usuario', () => {
    const usuario = {
      id: 123,
      email: 'test@fitandtrack.com',
      rol: 'entrenador'
    }

    const token = crearToken(usuario)

    expect(token).to.be.a('string')
    expect(token.length).to.be.greaterThan(10)

    const payload = validarToken(token)

    expect(payload).to.include({
      id: 123,
      email: 'test@fitandtrack.com',
      rol: 'entrenador'
    })

    expect(payload).to.have.property('iat')
    expect(payload).to.have.property('exp')
  })

  it('debería lanzar un error si el token es inválido', () => {
    const tokenTrucho = 'esto-no-es-un-token-valido'

    expect(() => validarToken(tokenTrucho)).to.throw()
  })
})
