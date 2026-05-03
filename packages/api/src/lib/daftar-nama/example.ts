import { DaftarNamaResellerAPI } from "./index";

const api = new DaftarNamaResellerAPI('https://api.daftarnama.id', 'YOUR_API_KEY');
const balance = await api.getMyBalance();
console.log(balance.data.balance);