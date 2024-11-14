process.env.NODE_ENV = "test"

const request = require("supertest");


const app = require("../app");
const db = require("../db");


let book_isbn;

beforeEach(async () => {
    let result = await db.query(`
        INSERT INTO
            books (isbn, amazon_url,author,language,pages,publisher,title,year)
            VALUES(
                '978-0143128540',
                'https://www.amazon.com/dp/014312854X',
                'Chimamanda Ngozi Adichie',
                'English',
                304,
                'Anchor',
                'Americanah',
                2014
            )
            RETURNING isbn    
    `);
    book_isbn = result.rows[0].isbn;
});

describe("GET /books", function () {
    test("Gets a list of books", async function () {
      const response = await request(app).get(`/books`);
      const books = response.body.books;
      expect(books).toHaveLength(1);
      expect(books[0]).toHaveProperty("isbn");
      expect(books[0]).toHaveProperty("amazon_url");
    });
});

describe("GET /books/:isbn", function () {
    test("Gets a book", async function () {
        const response = await request(app).get(`/books/${book_isbn}`)
        expect(response.body.book).toHaveProperty("isbn");
        expect(response.body.book.isbn).toBe(book_isbn);
    });
});

describe("POST /books", function () {
    test("Creates a new book", async function () {
        const response = await request(app).post("/books")
        .send({
            isbn: '978-0385545969',
            amazon_url: "https://www.amazon.com/dp/0385545967",
            author: "Tara Westover",
            language: "English",
            pages: 352,
            publisher: "Random House",
            title: "Educated: A",
            year: 2018
        })
        expect(response.body.book).toHaveProperty("isbn");
    });
});

describe("PUT /books/:id", function () {
    test("Updates a book", async function () {
        const response = await request(app).post("/books")
        .send({
            isbn: '978-0385545969',
            amazon_url: "https://www.amazon.com/dp/0385545967",
            author: "Tara Westover",
            language: "English",
            pages: 352,
            publisher: "Random House",
            title: "Educated: A Memoir",
            year: 2018
        })
        expect(response.body.book).toHaveProperty("isbn");
        expect(response.body.book.title).toEqual("Educated: A Memoir");
    });
});

describe("DELETE /books/:id", function () {
    test("Deletes a book", async function () {
      const response = await request(app)
          .delete(`/books/${book_isbn}`)
      expect(response.body).toEqual({message: "Book has been deleted"});
    });
  });

afterEach(async function () {
    await db.query("DELETE FROM BOOKS");
  });
  
  
afterAll(async function () {
    await db.end()
});