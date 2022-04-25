const dotenv = require('dotenv');
dotenv.config({ path: './src/config/.env' });

import { TypeOrmConfigService } from './database.service';
export default new TypeOrmConfigService().createTypeOrmOptions();
