//schemas/keywords.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class KeyWords extends Document {
  @Prop({ required: true })
  guide_id: number; // ID гайда, связанного с ключевыми словами

  @Prop({ type: [String], required: true })
  themes: string[]; // Сами ключевые слова
}

export const KeyWordsSchema = SchemaFactory.createForClass(KeyWords);
