const { generateMessage } = require('./message');

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
