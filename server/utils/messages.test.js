const { generateMessage, generateLocationMessage } = require('./message');

describe('Generate Message', () => {
  it('should generate correct message object', () => {
    const from = 'WDJ';
    const text = 'Some random text';

    const message = generateMessage(from, text);

    // Using Jest's expect function
    expect(typeof message.createdAt).toBe('number');

    expect(message).toMatchObject({ from, text });
  });
});

describe('Generate Location Message', () => {
  it('should generate correct location object', () => {
    const from = 'Claire',
      lat = 15,
      lng = 56;

    const url = `https://www.google.com/maps?q=${lat}, ${lng}`;

    const message = generateLocationMessage(from, lat, lng);

    // Using Jest's expect function
    expect(typeof message.createdAt).toBe('number');

    expect(message).toMatchObject({ from, url });
  });
});
