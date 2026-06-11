const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

const rawData = `Khairil Hafizh	Siswa kelas 10	85376371799	khairilhafizh30@gmail.com	Hadir	khairilhafizh30@gmail.com	khairilhafizh30@gmail.com	1234
Nurul Adzkia	Siswa kelas 10	88708099029	nuruladzkia101@gmail.com	Hadir	nuruladzkia101@gmail.com	nuruladzkia101@gmail.com	1234
Desman Oktavianus	Siswa kelas 10	83178932806	dharefa820@gmail.com	Hadir	dharefa820@gmail.com	dharefa820@gmail.com	1234
Risti Yani	Siswa kelas 10	82284721870	ristiyanii19@gmail.com	Hadir	ristiyanii19@gmail.com	ristiyanii19@gmail.com	1234
Keyla Gloria Harahap	Siswa kelas 10	82173176490	gloriyaharahap25@gmail.com	Hadir	gloriyaharahap25@gmail.com	gloriyaharahap25@gmail.com	1234
Nacwa Odelia Erwanda	Siswa kelas 10	85890422757	erwandaazwa@gmail.com	Hadir	erwandaazwa@gmail.com	erwandaazwa@gmail.com	1234
Azacky Maulana	Siswa kelas 10	83854015587	azackymaulana15@gmail.com	Hadir	azackymaulana15@gmail.com	azackymaulana15@gmail.com	1234
Syifatul Ulya	Siswa kelas 10	895365261078	ulyashifatul8@gmail.com	Hadir	ulyashifatul8@gmail.com	ulyashifatul8@gmail.com	1234
Nindi Azimatul Zakia	Siswa kelas 10	82286694436	nindiazimatul@gmail.com	Hadir	nindiazimatul@gmail.com	nindiazimatul@gmail.com	1234
Fatimah Azzahra	Siswa kelas 10	81378403148	fima75640@gmail.com	Hadir	fima75640@gmail.com	fima75640@gmail.com	1234
Cahaya Febrina	Siswa kelas 10	88708066171	ayyafebrina@icloud.com	Hadir	ayyafebrina@icloud.com	ayyafebrina@icloud.com	1234
Sri Kahirunnisa	Siswa kelas 10	82187990819	srikhairunnisa75@gmail.com	Hadir	srikhairunnisa75@gmail.com	srikhairunnisa75@gmail.com	1234
Zee Mazaya El Huae	Siswa kelas 10	82288527849	zeemazayaelhaque@gmail.com	Hadir	zeemazayaelhaque@gmail.com	zeemazayaelhaque@gmail.com	1234
Ziva Anandita Aprilia	Siswa kelas 10	82169016106	zivaananditaaprilia@gmail.com	Hadir	zivaananditaaprilia@gmail.com	zivaananditaaprilia@gmail.com	1234
Zahra Khairunnisa Syukri	Siswa kelas 10	88279054033	khrnszara@gmail.com	Hadir	khrnszara@gmail.com	khrnszara@gmail.com	1234
Keisha Faiha Sakhi	Siswa kelas 10	89524491877	keisha.f.s09@gmail.com	Hadir	keisha.f.s09@gmail.com	keisha.f.s09@gmail.com	1234
Shereen Umairy	Siswa kelas 10	81363900999	kalsumrangkutyummi@gmail.com	Hadir	kalsumrangkutyummi@gmail.com	kalsumrangkutyummi@gmail.com	1234
Nazwa Yofabelita	Siswa kelas 10	81364784631	yofabelitanazwa@gmail.com	Hadir	yofabelitanazwa@gmail.com	yofabelitanazwa@gmail.com	1234
Ahya sabrina	Siswa kelas 10	81440031939	sabrinaahya4@gmail.com	Hadir	sabrinaahya4@gmail.com	sabrinaahya4@gmail.com	1234
Safira Zulkarnain	Siswa kelas 10	81378454764	safirazulkarnain29@gmail.com	Hadir	safirazulkarnain29@gmail.com	safirazulkarnain29@gmail.com	1234
Indana Jehan Rafifah	Siswa kelas 10	89524015675	indanajehan7@gmail.com	Hadir	indanajehan7@gmail.com	indanajehan7@gmail.com	1234
Zakia Ramadhani	Siswa kelas 10	83824663359	rzaskia783@gmail.com	Hadir	rzaskia783@gmail.com	rzaskia783@gmail.com	1234
Jihan Makaila	Siswa kelas 10	81266005027	jihanmputri2000@gmail.com	Hadir	jihanmputri2000@gmail.com	jihanmputri2000@gmail.com	1234
Fanessa Salsabila	Siswa kelas 10	83837686303	fanessasalsabila909@gmail.com	Hadir	fanessasalsabila909@gmail.com	fanessasalsabila909@gmail.com	1234
Ayu Kuarta	Siswa kelas 10	83813139806	ayukuartafiransyah01@gmail.com	Hadir	ayukuartafiransyah01@gmail.com	ayukuartafiransyah01@gmail.com	1234
Rezky Revaldo	Siswa kelas 11	81219804893	rezkyrevaldo72@gmail.com	Hadir	rezkyrevaldo72@gmail.com	rezkyrevaldo72@gmail.com	1234
Kheisya Dini Putri	Siswa kelas 11	81364792280	kheisyadini24@gmail.com	Hadir	kheisyadini24@gmail.com	kheisyadini24@gmail.com	1234
Galvin Gastano	Siswa kelas 11	83183267319	galvingastano92@gmail.com	Hadir	galvingastano92@gmail.com	galvingastano92@gmail.com	1234
Fawwaz Haziq	Siswa kelas 11	895328893023	fawwazhaziq924@gmail.com	Hadir	fawwazhaziq924@gmail.com	fawwazhaziq924@gmail.com	1234
Najwa Maulidina Arlan	Siswa kelas 11	89531373260	maulidinanajwa6@gmail.com	Hadir	maulidinanajwa6@gmail.com	maulidinanajwa6@gmail.com	1234
Nazrha Rizki Azlia	Siswa kelas 11	895321612020	nazrharizkiazlia@gmail.com	Hadir	nazrharizkiazlia@gmail.com	nazrharizkiazlia@gmail.com	1234
Arindi Khumayra	Siswa kelas 11	*082171115767	arindikhumayra@gmail.com	Hadir	arindikhumayra@gmail.com	arindikhumayra@gmail.com	1234
Chelsylia atha Deza	Siswa kelas 11	83822534059	chelsylia1812@gmail.com	Hadir	chelsylia1812@gmail.com	chelsylia1812@gmail.com	1234
Maia Paramitha Yosefa	Siswa kelas 11	81275552144	maiaparamitay@gmail.com	Hadir	maiaparamitay@gmail.com	maiaparamitay@gmail.com	1234
Nabila Ivana	Siswa kelas 11	85142259826	nabilaivana.2810@gmail.com	Hadir	nabilaivana.2810@gmail.com	nabilaivana.2810@gmail.com	1234
Ariel Fahrezi	Siswa kelas 11	83836557198	fahreziaril@gmail.com	Hadir	fahreziaril@gmail.com	fahreziaril@gmail.com	1234
Yudha ananta	Siswa kelas 11	83150725996	anantayudha86@gmail.com	Hadir	anantayudha86@gmail.com	anantayudha86@gmail.com	1234
Keysa Allea Shareen	Siswa kelas 11	85364204811	keishaalleashaarreen@gmail.com	Hadir	keishaalleashaarreen@gmail.com	keishaalleashaarreen@gmail.com	1234
Nayla Lutfia hadi	Siswa kelas 11	85187170798	naylaluthfia132@gmail.com	Hadir	naylaluthfia132@gmail.com	naylaluthfia132@gmail.com	1234
Yussi Ariyanti	Siswa kelas 11	85187170494	yussiariyanti7@gmail.com	Hadir	yussiariyanti7@gmail.com	yussiariyanti7@gmail.com	1234
Ghassany Kayla Rizal	Siswa kelas 11	85274470791	ghassaniykaylarizal@gmail.com	Hadir	ghassaniykaylarizal@gmail.com	ghassaniykaylarizal@gmail.com	1234
Nazhira Azzahra	Siswa kelas 11	82384172529	nazhiraazzahra5@gmail.com	Hadir	nazhiraazzahra5@gmail.com	nazhiraazzahra5@gmail.com	1234
Shelina Asyifa	Siswa kelas 11	895400809481	shelinaasyifa@gmail.com	Hadir	shelinaasyifa@gmail.com	shelinaasyifa@gmail.com	1234
Asyifa Nur Adila	Siswa kelas 11	82181735035	syifanurdila08@gmail.com	Hadir	syifanurdila08@gmail.com	syifanurdila08@gmail.com	1234
Daffa haykal	Siswa kelas 11	82363113688	hyl.daffa@gmail.com	Hadir	hyl.daffa@gmail.com	hyl.daffa@gmail.com	1234
Windy Novriza yanti	Siswa kelas 11	83186236119	windynovrizaa13@gmail.com	Hadir	windynovrizaa13@gmail.com	windynovrizaa13@gmail.com	1234
Ava hanan Guvil	Siswa kelas 11	81297523558	avaguvil@gmail.com	Hadir	avaguvil@gmail.com	avaguvil@gmail.com	1234
Nadia Syarifa	Siswa kelas 11	83843740853	nadiasyarifa2508@gmail.com	Hadir	nadiasyarifa2508@gmail.com	nadiasyarifa2508@gmail.com	1234
Nurul Hasanah	Siswa kelas 11	83822538172	nh2826242@gmail.com	Hadir	nh2826242@gmail.com	nh2826242@gmail.com	1234
Airlangga 	Siswa kelas 11	83813045872	anairlangga2@gmail.com	Hadir	anairlangga2@gmail.com	anairlangga2@gmail.com	1234
Ayu lestari	Siswa kelas 11	85187170441	aayyuuuu04@gmail.com	Hadir	aayyuuuu04@gmail.com	aayyuuuu04@gmail.com	1234
Mutiara fadhilla	Siswa kelas 11	89530793008	mutiarafadhila28@gmail.com	Hadir	mutiarafadhila28@gmail.com	mutiarafadhila28@gmail.com	1234
Nurapsa 	Siswa kelas 11	85837468730	nurapsanura2@gmail.com	Hadir	nurapsanura2@gmail.com	nurapsanura2@gmail.com	1234
Rahmi salsabila	Siswa kelas 11	85765702206	rahmi6186@gmail.com	Hadir	rahmi6186@gmail.com	rahmi6186@gmail.com	1234
Amirah dini yati	Siswa kelas 11	83187410533	amiiradiniyati@gmail.com	Hadir	amiiradiniyati@gmail.com	amiiradiniyati@gmail.com	1234
Dimas Anggoro	Siswa kelas 11	89502120066	anggorodimas742@gmail.com	Hadir	anggorodimas742@gmail.com	anggorodimas742@gmail.com	1234
Gitratul Cahaya Putri	Siswa kelas 11	89692110629	putrigitratul@gmail.com	Hadir	putrigitratul@gmail.com	putrigitratul@gmail.com	1234
Annisa aprilia efendi	Siswa kelas 11	83842857646	annisaaprilliana00@gmail.com	Hadir	annisaaprilliana00@gmail.com	annisaaprilliana00@gmail.com	1234
Danissa Lutfan Syah	Siswa kelas 11	81276217337	d.lutfansyah@gmail.com	Hadir	d.lutfansyah@gmail.com	d.lutfansyah@gmail.com	1234
Ziland Putra Jadewa	Siswa kelas 11	83867043328	zilandputrajadewa@gmail.com	Hadir	zilandputrajadewa@gmail.com	zilandputrajadewa@gmail.com	1234
Anggia Nanda, M.Si	Guru Waka Kesiswaan	81363433796		Hadir	anggia.sman5.bukittinggi@edumind.or.id	anggia.sman5.bukittinggi@edumind.or.id	1234
Sri Oktavia, S.Pd	Guru (Lainnya)	8126797659		Hadir	sri.sman5.bukittinggi@edumind.or.id	sri.sman5.bukittinggi@edumind.or.id	1234
Ramlan, S.Pd	Guru BK	85263157095	ramlan.lobe@gmail.com	Hadir	ramlan.lobe@gmail.com	ramlan.lobe@gmail.com	1234
Maiyusta, S.Pd	Guru BK	81363265106	maiyusta05@guru.sma.belajar.id	Hadir	maiyusta05@guru.sma.belajar.id	maiyusta05@guru.sma.belajar.id	1234
Ilham Mida, S.PdI	Guru BK	82219989420	ilhammida32@guru.sma.belajar.id	Hadir	ilhammida32@guru.sma.belajar.id	ilhammida32@guru.sma.belajar.id	1234
Rahmi Seswita, S.PdI	Guru BK	82211965802	seswitarahmi1@gmail.com	Hadir	seswitarahmi1@gmail.com	seswitarahmi1@gmail.com	1234
Miftah Hatul Husna,S.Pd, Gr	Guru BK	85263888638	miftahhusna88@guru.sma.belajar.id	Hadir	miftahhusna88@guru.sma.belajar.id	miftahhusna88@guru.sma.belajar.id	1234
Yessi Kurniati, S.Pd, Gr	Guru BK	82311256911	yessi.kurniati34@guru.sma.belajar.id	Hadir	yessi.kurniati34@guru.sma.belajar.id	yessi.kurniati34@guru.sma.belajar.id	1234
Harmiyati, S.Pd	Guru Walas	81268156355		Hadir	harmiyati,.sman5.bukittinggi@edumind.or.id	harmiyati,.sman5.bukittinggi@edumind.or.id	1234
Aksesio Rizanty, S.Pd	Guru Walas	81363461394			aksesio.sman5.bukittinggi@edumind.or.id	aksesio.sman5.bukittinggi@edumind.or.id	1234`;

const SCHOOL_ID = "6a26f0217b479aaa9e986c68"; // SMAN 5 BUKITTINGGI

async function main() {
  const uri = "mongodb://admin:gg8SrJI4TzdSnrYy@ac-vmul2sw-shard-00-00.zx7sp2f.mongodb.net:27017,ac-vmul2sw-shard-00-01.zx7sp2f.mongodb.net:27017,ac-vmul2sw-shard-00-02.zx7sp2f.mongodb.net:27017/edumind?replicaSet=atlas-bqzxxo-shard-0&ssl=true&authSource=admin";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    const usersCollection = db.collection("users");

    const lines = rawData.split('\n').filter(l => l.trim().length > 0);
    const parsedData = lines.map((line, idx) => {
      const parts = line.split('\t');
      
      let password = parts[parts.length - 1] ? parts[parts.length - 1].trim() : "1234";
      let emailEdu = parts[parts.length - 2] ? parts[parts.length - 2].trim() : "";
      // If email edu is the same as password due to empty last col, we fallback
      if (emailEdu === "1234") {
        emailEdu = parts[parts.length - 3] ? parts[parts.length - 3].trim() : "";
      }
      
      let otherEmail = parts[3] ? parts[3].trim() : "";
      
      let finalEmail = emailEdu;
      if (!finalEmail || finalEmail.length < 5) finalEmail = otherEmail;
      
      let role = "student";
      let kelas = parts[1] ? parts[1].toLowerCase() : "";
      if (kelas.includes("guru") || kelas.includes("waka") || kelas.includes("walas")) {
        role = "teacher";
      }

      return {
        fullname: parts[0].trim(),
        email: finalEmail.toLowerCase(),
        password: password,
        role: role
      };
    }).filter(d => d.email && d.email.includes("@"));

    console.log(`Parsed ${parsedData.length} valid rows from ${lines.length} lines`);

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
      const existingUser = await usersCollection.findOne({ email: item.email });
      
      if (existingUser) {
        const isMatch = await bcrypt.compare(item.password, existingUser.password);
        let schoolUpdated = false;
        
        let shouldUpdateRole = existingUser.role !== item.role;
        let updateDoc = {};
        
        if (!existingUser.school_id || existingUser.school_id.toString() !== SCHOOL_ID) {
          updateDoc.school_id = new ObjectId(SCHOOL_ID);
          updateDoc.institution_id = SCHOOL_ID;
          schoolUpdated = true;
        }

        if (shouldUpdateRole) {
          updateDoc.role = item.role;
        }

        if (Object.keys(updateDoc).length > 0) {
          await usersCollection.updateOne({ _id: existingUser._id }, { $set: updateDoc });
        }

        results.alreadyExists.push({
          email: item.email,
          loginTest: isMatch ? "SUCCESS" : "FAILED (wrong password)",
          schoolUpdated: schoolUpdated,
          roleUpdated: shouldUpdateRole
        });
      } else {
        try {
          const hashedPassword = await bcrypt.hash(item.password, 10);
          
          const newUser = {
            email: item.email,
            password: hashedPassword,
            fullname: item.fullname || item.email.split('@')[0],
            role: item.role,
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
        let updates = [];
        if (r.schoolUpdated) updates.push("School Updated to SMAN 5 Bukittinggi");
        if (r.roleUpdated) updates.push("Role Updated");
        console.log(`- ${r.email}: Login Test = ${r.loginTest}${updates.length > 0 ? ', ' + updates.join(', ') : ''}`);
      });
    }

    if (results.inserted.length > 0) {
      console.log("\n--- Users Successfully Inserted ---");
      results.inserted.forEach(email => console.log(`- ${email}`));
    }
    
    if (results.errors.length > 0) {
        console.log("\n--- Errors ---");
        results.errors.forEach(e => console.log(`- ${e.email}: ${e.error}`));
    }

  } finally {
    await client.close();
  }
}

main().catch(console.error);
