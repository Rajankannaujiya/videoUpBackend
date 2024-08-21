

import db from "./db";

async function createUsersTable() {
    const result = await db.query(`
        CREATE TABLE IF NOT EXISTS my_users(
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(300) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `)
}


async function createVideoTable(){
    const result = await db.query(`
        CREATE TABLE IF NOT EXISTS videos (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            video_public_id VARCHAR(255) NOT NULL,
            video_url TEXT NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            duration FLOAT NOT NULL,
            owner_id UUID NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            CONSTRAINT fk_owner
             FOREIGN KEY(owner_id) 
            REFERENCES my_users(id) 
        );
`)
}




// export async function alterImageTable() {
//     await db.query(`
//       ALTER TABLE images
//       ADD COLUMN id_new UUID DEFAULT uuid_generate_v4();
  
//       UPDATE images
//       SET id_new = uuid_generate_v4();
  
//       ALTER TABLE images
//       DROP COLUMN id,
//       DROP COLUMN duration;
  
//       ALTER TABLE images
//       RENAME COLUMN id_new TO id;
  
//       ALTER TABLE images
//       ADD CONSTRAINT images_pkey PRIMARY KEY (id);
//     `);
//   }
  
async function createImageTable(){
    const result = await db.query(`
        CREATE TABLE IF NOT EXISTS images (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            image_public_id VARCHAR(255) NOT NULL,
            image_url TEXT NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            owner_id UUID NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            CONSTRAINT fk_owner
             FOREIGN KEY(owner_id) 
            REFERENCES my_users(id) 
        );
`)
}
  
export {createUsersTable, createVideoTable,createImageTable}