const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

const data = `keyshakhalilakhairul@gmail.com	1234
orangtwit@gmail.com	1234
userputriaura@gmail.com	1234
ginaerwan2018@gmail.com	1234
nurulnafisah434@gmail.com	1234
annisanurhasanah200707@gmail.com	1234
keyshaaurora111@gmail.com	1234
rrainaannisavyoni@gmail.com	1234
nafishah.sman2.bukittinggi@edumind.or.id	1234
assyifakanzharaihana@gmail.com	1234
Pasyakhairatunnisa5@gmail.com	1234
keishalasmonosafira@gmail.com	1234
kaysyafaramartha@gmail.com	1234
female.aprilia@gmail.com	1234
zakiyaarahima@gmail.com	1234
tridianka93@gmail.com	1234
syafirawandilaura@gmail.com	1234
aultiana59@gmail.com	1234
nairashakila179@gmail.com	1234
akifanailadewandari@gmail.com	1234
fatmawulandari966@gmail.com	1234
nonazahra2009@gmail.com	1234
zikranafizah72@smp.belajar.id	1234
rehanasagita12@gmail.com	1234
khumairrarara@gmail.com	1234
chiarachatlina216@gmail.com	1234
kenzovalez2020@gmail.com	1234
zahirakaylla7@gmail.com	1234
hannyfresthikadevi@gmail.com	1234
ihzamahenra671@gmail.com	1234
rezkiaraishaa@gmail.com	1234
shadiqrenisya@gmail.com	1234
adivarahmasurya@gmail.com	1234
syakiraathayaakbar@gmail.com	1234
andiniayuna4@gmail.com	1234
nurulrahmah0801@gmail.com	1234
28aazella@gmail.com	1234
metaaa2009@gmail.com	1234
adisarahimasurya@gmail.com	1234
sultanarkhan27@gmail.com	1234
fayza.balqis09@gmail.com	1234
abdulazizm0920@gmail.com	1234
khair.aniipii@gmail.com	1234
mauragendis02@gmail.com	1234
hafizah.sman2.bukittinggi@edumind.or.id	1234
verizqi.sman2.bukittinggi@edumind.or.id	1234
syfanadifa@gmail.com	1234
aurasuhendra69@gmail.com	1234
amirmardios@gmail.com	1234
nurainilaifa@gmail.com	1234
aulia.sman2.bukittinggi@edumind.or.id	1234
faturalfaridzi09@gmail.com	1234
cecenintanpermataputri@gmail.com	1234
putrialzahra58@gmail.com	1234
nadhif.sman2.bukittinggi.bukittinggi@edumind.or.id	1234
nazwaaazzhra392@gmail.com	1234
suciramadhanineww@gmail.com	1234
halimatus.sman2.bukittinggi@edumind.or.id	1234
elga.sman2.bukittinggi@edumind.or.id	1234
dimasvathonyramadhan@gmail.com	1234
renti.sman2.bukittinggi@edumind.or.id	1234
neli.sman2.bukittinggi@edumind.or.id	1234
rika.sman2.bukittinggi@edumind.or.id	1234
yuli.sman2.bukittinggi@edumind.or.id	1234
lulu'.sman2.bukittinggi@edumind.or.id	1234
rita.sman2.bukittinggi@edumind.or.id	1234
gusnirizky@gmail.com	1234
reni.sman2.bukittinggi@edumind.or.id	1234
yanisemilda@gmail.com	1234
yulia.sman2.bukittinggi@edumind.or.id	1234`;

const SCHOOL_ID = "6a26ea9e7b479aaa9e986c62";

async function main() {
  const uri = "mongodb://admin:gg8SrJI4TzdSnrYy@ac-vmul2sw-shard-00-00.zx7sp2f.mongodb.net:27017,ac-vmul2sw-shard-00-01.zx7sp2f.mongodb.net:27017,ac-vmul2sw-shard-00-02.zx7sp2f.mongodb.net:27017/edumind?replicaSet=atlas-bqzxxo-shard-0&ssl=true&authSource=admin";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    const usersCollection = db.collection("users");

    const lines = data.split('\n').filter(l => l.trim().length > 0);
    const parsedData = lines.map(line => {
      const parts = line.split('\t');
      return {
        email: parts[0].trim().toLowerCase(),
        password: parts[1] ? parts[1].trim() : "1234"
      };
    });

    // Check duplicates in input
    const emailCounts = {};
    const inputDuplicates = [];
    parsedData.forEach(p => {
      emailCounts[p.email] = (emailCounts[p.email] || 0) + 1;
      if (emailCounts[p.email] === 2) {
        inputDuplicates.push(p.email);
      }
    });

    console.log("=== CHECKING INPUT DUPLICATES ===");
    if (inputDuplicates.length > 0) {
      console.log("Found duplicate emails in your input data:", inputDuplicates);
    } else {
      console.log("No duplicates in your input data.");
    }
    console.log("");

    const results = {
      alreadyExists: [],
      inserted: [],
      errors: []
    };

    for (const item of parsedData) {
      // check if exists
      const existingUser = await usersCollection.findOne({ email: item.email });
      
      if (existingUser) {
        // check if password matches (test login)
        const isMatch = await bcrypt.compare(item.password, existingUser.password);
        
        // ensure school is SMAN 2 Bukittinggi
        let schoolUpdated = false;
        if (!existingUser.school_id || existingUser.school_id.toString() !== SCHOOL_ID) {
          await usersCollection.updateOne({ _id: existingUser._id }, { $set: { school_id: new ObjectId(SCHOOL_ID), institution_id: SCHOOL_ID } });
          schoolUpdated = true;
        }

        results.alreadyExists.push({
          email: item.email,
          loginTest: isMatch ? "SUCCESS" : "FAILED (wrong password)",
          schoolUpdated: schoolUpdated
        });
      } else {
        // create new user
        try {
          const hashedPassword = await bcrypt.hash(item.password, 10);
          
          const newUser = {
            email: item.email,
            password: hashedPassword,
            fullname: item.email.split('@')[0], // Use part before @ as name
            role: "student",
            school_id: new ObjectId(SCHOOL_ID),
            institution_id: SCHOOL_ID,
            is_verified: true,
            is_active: true,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          await usersCollection.insertOne(newUser);
          results.inserted.push(item.email);
        } catch (err) {
          results.errors.push({ email: item.email, error: err.message });
        }
      }
    }

    console.log("=== RESULTS ===");
    console.log(`Total data to process: ${parsedData.length}`);
    console.log(`Already exists in DB: ${results.alreadyExists.length}`);
    console.log(`Newly inserted into DB: ${results.inserted.length}`);
    console.log(`Errors: ${results.errors.length}`);
    console.log("");

    if (results.alreadyExists.length > 0) {
      console.log("--- Users Already in DB ---");
      results.alreadyExists.forEach(r => {
        console.log(`- ${r.email}: Login Test = ${r.loginTest}${r.schoolUpdated ? ', School Updated to SMAN 2 Bukittinggi' : ''}`);
      });
    }

    if (results.inserted.length > 0) {
      console.log("\n--- Users Successfully Inserted ---");
      results.inserted.forEach(email => console.log(`- ${email}`));
    }

  } finally {
    await client.close();
  }
}

main().catch(console.error);
