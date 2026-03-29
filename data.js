
const PAINTINGS_CSV = `



1,"Puoliksi täynnä",100€,yes,40x30cm
2,"Vastarannalla",100€,yes,41x33cm
3,"Älä häiritse",40€,yes,24x20cm
4,"Morning after",300€,no,70x35cm



`;























// Don't edit below this line
const PRICES_DATA = {};
PAINTINGS_CSV.trim().split('\n').forEach(line => {
  const parts = line.split(',');
  if (parts.length >= 5) {
    const id = parts[0].trim();
    PRICES_DATA[id] = {
      name: parts[1].trim(),
      price: parts[2].trim(),
      available: parts[3].trim().toLowerCase() === 'yes',
      dimensions: parts[4].trim()
    };
  }
});
