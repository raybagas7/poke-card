const crypto = require('crypto');
const { Pool } = require('pg');
const NotFoundError = require('../../exceptions/NotFoundError');

class VerificationsService {
  constructor(usersService) {
    this._pool = new Pool();
    this._usersService = usersService;
  }

  async deleteVerificationToken(userId, token) {
    await this.checkVerificationEmailAvailability(userId, token);

    const query = {
      text: 'DELETE FROM verifications WHERE owner = $1 AND token = $2',
      values: [userId, token],
    };

    await this._pool.query(query);
    await this._usersService.validatingUser(userId);
  }

  async checkVerificationEmailAvailability(userId, token) {
    const query = {
      text: 'SELECT * FROM verifications WHERE owner = $1 AND token = $2',
      values: [userId, token],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Verifications not found');
    }
  }

  async checkEmailAvailability(userId) {
    const query = {
      text: 'SELECT email FROM users WHERE id = $1',
      values: [userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Email not found');
    }
  }

  async addVerifyToken(userId) {
    await this.checkEmailAvailability(userId);
    const randStringGenerator = crypto.randomBytes(64).toString('hex');
    const query = {
      text: 'INSERT INTO verifications VALUES($1, $2)',
      values: [userId, randStringGenerator],
    };

    await this._pool.query(query);
  }
}

module.exports = VerificationsService;
