import { createServer } from './infrastructure/http/app';
import 'dotenv/config'; 

const app = createServer();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger API documentation: http://localhost:${PORT}/api-docs`);
});