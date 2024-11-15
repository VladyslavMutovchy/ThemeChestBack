// schemas/chapters.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema()
export class Chapter {
  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  chapter: any; 
}

@Schema()
export class Chapters extends Document {
  @Prop({ required: true })
  guide_id: number; // ID гайда, связанного с главами

  @Prop({ type: [MongooseSchema.Types.Mixed], required: true })
  chapters: any[];
}

export const ChapterSchema = SchemaFactory.createForClass(Chapter);
export const ChaptersSchema = SchemaFactory.createForClass(Chapters);
