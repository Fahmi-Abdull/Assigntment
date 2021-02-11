/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { MotorcycleAsset } from './motorcycle-asset';

@Info({title: 'MotorcycleAssetContract', description: 'My Smart Contract' })
export class MotorcycleAssetContract extends Contract {

    @Transaction(false)
    @Returns('boolean')
    public async motorcycleAssetExists(ctx: Context, motorcycleAssetId: string): Promise<boolean> {
        const data: Uint8Array = await ctx.stub.getState(motorcycleAssetId);
        return (!!data && data.length > 0);
    }

    @Transaction()
    public async createMotorcycleAsset(ctx: Context, motorcycleAssetId: string, value: string): Promise<void> {
        const exists: boolean = await this.motorcycleAssetExists(ctx, motorcycleAssetId);
        if (exists) {
            throw new Error(`The motorcycle asset ${motorcycleAssetId} already exists`);
        }
        const motorcycleAsset: MotorcycleAsset = new MotorcycleAsset();
        motorcycleAsset.value = value;
        const buffer: Buffer = Buffer.from(JSON.stringify(motorcycleAsset));
        await ctx.stub.putState(motorcycleAssetId, buffer);
    }

    @Transaction(false)
    @Returns('MotorcycleAsset')
    public async readMotorcycleAsset(ctx: Context, motorcycleAssetId: string): Promise<MotorcycleAsset> {
        const exists: boolean = await this.motorcycleAssetExists(ctx, motorcycleAssetId);
        if (!exists) {
            throw new Error(`The motorcycle asset ${motorcycleAssetId} does not exist`);
        }
        const data: Uint8Array = await ctx.stub.getState(motorcycleAssetId);
        const motorcycleAsset: MotorcycleAsset = JSON.parse(data.toString()) as MotorcycleAsset;
        return motorcycleAsset;
    }

    @Transaction()
    public async updateMotorcycleAsset(ctx: Context, motorcycleAssetId: string, newValue: string): Promise<void> {
        const exists: boolean = await this.motorcycleAssetExists(ctx, motorcycleAssetId);
        if (!exists) {
            throw new Error(`The motorcycle asset ${motorcycleAssetId} does not exist`);
        }
        const motorcycleAsset: MotorcycleAsset = new MotorcycleAsset();
        motorcycleAsset.value = newValue;
        const buffer: Buffer = Buffer.from(JSON.stringify(motorcycleAsset));
        await ctx.stub.putState(motorcycleAssetId, buffer);
    }

    @Transaction()
    public async deleteMotorcycleAsset(ctx: Context, motorcycleAssetId: string): Promise<void> {
        const exists: boolean = await this.motorcycleAssetExists(ctx, motorcycleAssetId);
        if (!exists) {
            throw new Error(`The motorcycle asset ${motorcycleAssetId} does not exist`);
        }
        await ctx.stub.deleteState(motorcycleAssetId);
    }

    @Transaction(false)
    public async queryAllAssets(ctx: Context): Promise<string> {
        const startKey = '000';
        const endKey = '999';
        const iterator = await ctx.stub.getStateByRange(startKey, endKey);
        const allResults = [];
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString());

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString());
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString();
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }

}
