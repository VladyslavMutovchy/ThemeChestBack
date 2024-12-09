// schemas/guides.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema()
export class FavoriteGuides extends Document {
  @Prop({ required: true, unique: true }) 
  user_id: number;

  @Prop({ type: [Number], required: true }) 
  favorite_guides: number[];
}

export const FavoriteSchema = SchemaFactory.createForClass(FavoriteGuides);

