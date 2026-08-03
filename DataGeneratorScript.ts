import * as fs from 'fs';

function generateData(count: number) {
  const firstNames = ["Rahul", "Raju", "Sohail", "Ayaan", "Pooja"];
  const lastNames = ["Khan", "Verma", "Shaikh", "Sharma", "Patel"];
  const result = [];

  for (let i = 1; i <= count; i++) {
    result.push({
      id: i,
      firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
      lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
      age: Math.floor(Math.random() * 50) + 18,
      salary: Math.floor(Math.random() * 80000) + 20000
    });
  }

  fs.writeFileSync('./public/data/employees.json', JSON.stringify(result, null, 2));
}

generateData(50000);
