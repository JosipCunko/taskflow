import admin from "firebase-admin";
import { readFileSync } from "fs";

let serviceAccount;
try {
  serviceAccount = JSON.parse(
    readFileSync("./firebase-admin-sdk-key.json", "utf8")
  );
} catch (error) {
  console.error("Error reading firebase-admin-sdk-key.json:", error.message);
  process.exit(1);
}

// Check if Firebase app is already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// Function to recursively convert Timestamps to numbers
const convertTimestampsToNumbers = (data) => {
  if (data === null || typeof data !== "object") {
    return data;
  }

  if (data instanceof admin.firestore.Timestamp) {
    return data.toMillis();
  }

  if (data instanceof Date) {
    return data.getTime();
  }

  if (Array.isArray(data)) {
    return data.map((item) => convertTimestampsToNumbers(item));
  }

  const newData = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      newData[key] = convertTimestampsToNumbers(data[key]);
    }
  }
  return newData;
};

const migrateCollection = async (collectionName) => {
  console.log(`Starting migration for "${collectionName}" collection...`);

  // Add safety check
  console.log(
    `⚠️  This script will modify ALL documents in the '${collectionName}' collection.`
  );
  console.log("⚠️  Make sure you have a backup before proceeding!");

  const collectionRef = db.collection(collectionName);
  const snapshot = await collectionRef.get();

  if (snapshot.empty) {
    console.log(`No documents found in "${collectionName}" collection.`);
    return;
  }

  console.log(`Found ${snapshot.docs.length} documents to migrate.`);

  // Process in smaller batches to be safer
  let batch = db.batch();
  let batchSize = 0;
  let totalProcessed = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const migratedData = convertTimestampsToNumbers(data);

    // Only update if there are actual changes
    const hasChanges = JSON.stringify(data) !== JSON.stringify(migratedData);
    if (hasChanges) {
      batch.set(doc.ref, migratedData);
      batchSize++;
      console.log(`Queued document ${doc.id} for migration`);
    } else {
      console.log(`Document ${doc.id} already has correct format, skipping`);
    }

    totalProcessed++;

    // Commit batch when it reaches 100 documents (safer than 500)
    if (batchSize >= 100) {
      console.log(
        `Committing batch of ${batchSize} documents... (${totalProcessed}/${snapshot.docs.length} processed)`
      );
      await batch.commit();
      batch = db.batch(); // Re-initialize batch after commit
      batchSize = 0;
    }
  }

  // Commit any remaining documents
  if (batchSize > 0) {
    console.log(`Committing the final batch of ${batchSize} documents...`);
    await batch.commit();
  }

  console.log(
    `✅ Migration for "${collectionName}" collection completed successfully.`
  );
  console.log(`📊 Total documents processed: ${totalProcessed}`);
};

migrateCollection("userActivityLogs").catch(console.error);
