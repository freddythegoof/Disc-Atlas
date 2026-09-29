import {sqliteTable,text,integer,primaryKey} from 'drizzle-orm/sqlite-core';
export const profiles=sqliteTable('profiles',{
 userId:text('user_id').primaryKey(),profile:text('profile').notNull(),updatedAt:text('updated_at').notNull()
});
export const bagItems=sqliteTable('bag_items',{
 userId:text('user_id').notNull(),id:text('id').notNull(),discId:text('disc_id').notNull(),plastic:text('plastic').notNull().default(''),weight:integer('weight'),wear:text('wear').notNull().default('unknown'),notes:text('notes').notNull().default(''),color:text('color').notNull().default(''),photoKey:text('photo_key'),createdAt:text('created_at').notNull()
},t=>[primaryKey({columns:[t.userId,t.id]})]);
export const coachUsage=sqliteTable('coach_usage',{
 userId:text('user_id').notNull(),day:text('day').notNull(),count:integer('count').notNull().default(0)
},t=>[primaryKey({columns:[t.userId,t.day]})]);
