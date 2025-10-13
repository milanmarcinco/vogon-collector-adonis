import db from '@adonisjs/lucid/services/db'
import { test } from '@japa/runner'

import User from '#models/user'

test.group('auth', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()

    return async () => {
      await db.rollbackGlobalTransaction()
    }
  })

  test('registers a user', async ({ client, assert }) => {
    const response = await client.post('/auth/register').json({
      email: 'test@example.com',
      password: 'secret123',
    })

    response.assertStatus(201)
    assert.property(response.body(), 'token')

    const user = await User.findBy('email', 'test@example.com')
    assert.exists(user)
  })

  test('logs in and returns an access token', async ({ client, assert }) => {
    await User.create({
      email: 'test@example.com',
      password: 'secret123',
    })

    const response = await client.post('/auth/login').json({
      email: 'test@example.com',
      password: 'secret123',
    })

    response.assertStatus(201)
    assert.property(response.body(), 'token')
  })

  test('logs out and invalidates token', async ({ client, assert }) => {
    const user = await User.create({
      email: 'test@example.com',
      password: 'secret123',
    })

    const loginRes = await client.post('/auth/login').json({
      email: 'test@example.com',
      password: 'secret123',
    })

    const token = loginRes.body().token
    const logoutRes = await client.post('/auth/logout').header('Authorization', `Bearer ${token}`)

    logoutRes.assertStatus(200)

    const dbToken = await db.from('auth_access_tokens').where('tokenable_id', user.id).first()
    assert.isNull(dbToken)
  })

  test('deletes a user (authorized)', async ({ client, assert }) => {
    const user = await User.create({
      email: 'delete@example.com',
      password: 'secret123',
    })

    const loginRes = await client.post('/auth/login').json({
      email: 'delete@example.com',
      password: 'secret123',
    })

    const token = loginRes.body().token

    const deleteRes = await client.delete(`/auth/delete`).header('Authorization', `Bearer ${token}`)

    deleteRes.assertStatus(200)

    const deletedUser = await User.find(user.id)
    assert.isNull(deletedUser)

    const dbToken = await db.from('auth_access_tokens').where('tokenable_id', user.id).first()
    assert.isNull(dbToken)
  })
})
