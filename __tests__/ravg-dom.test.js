const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('RAVG.html tests', () => {

    let dom; 
    let document;

    beforeEach(() => {
        const html = fs.readFileSync(path.resolve(__dirname, '../ravg.html'), 'utf8');
        dom = new JSDOM(html);
        document = dom.window.document;
        global.window = dom.window;
        global.document = document;
    });

    test("correct page title", () => {
        const title = document.querySelector('title').textContent;
        expect(title).toBe('Data Explorer | RAVG');
    });

})