let envFilePath = './src/config/.env';
if (process.env.NODE_ENV) {
  envFilePath = './src/config/.env.' + process.env.NODE_ENV;
}

const dotenv = require('dotenv');
dotenv.config({ path: envFilePath });

import { TypeOrmConfigService } from './database.service';
export default new TypeOrmConfigService().createTypeOrmOptions();
