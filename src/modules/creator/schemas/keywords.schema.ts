//schemas/keywords.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class KeyWords extends Document {
  @Prop({ required: true })
  guide_id: number; 

  @Prop({ type: [Number], required: true })
  themes: number[]; 
}

export const KeyWordsSchema = SchemaFactory.createForClass(KeyWords);
