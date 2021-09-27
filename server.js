const express = require("express");
const faunadb = require("faunadb");
const q = faunadb.query;

const secret = process.env.FAUNADB_SERVER_SECRET;

const client = new faunadb.Client({
  secret: secret,
});

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 8000;

app.get("/posts", async (req, res) => {
  try {
    const { data } = await client.query(
      q.Map(
        q.Paginate(q.Match(q.Index("all_posts"))),
        q.Lambda((x) => q.Get(x))
      )
    );

    res.status(200).json(data[0]["data"]);
  } catch (error) {
    res.status(500).json({ error: error.description });
  }
});

app.post("/posts", async (req, res) => {
  console.log("Got here!", secret);

  try {
    const { post, description } = req.body;
    const { data } = await client.query(
      q.Create(q.Ref(q.Collection("Posts"), "123"), {
        data: { post, description },
      })
    );

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () =>
  console.log(`🚀🚀 Server listening at port ${PORT} 🚀🚀🚀`)
);
