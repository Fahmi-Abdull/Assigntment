/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context } from 'fabric-contract-api';
import { ChaincodeStub, ClientIdentity } from 'fabric-shim';
import { MotorcycleAssetContract } from '.';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import winston = require('winston');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext implements Context {
    public stub: sinon.SinonStubbedInstance<ChaincodeStub> = sinon.createStubInstance(ChaincodeStub);
    public clientIdentity: sinon.SinonStubbedInstance<ClientIdentity> = sinon.createStubInstance(ClientIdentity);
    public logger = {
        getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
        setLevel: sinon.stub(),
     };
}

describe('MotorcycleAssetContract', () => {

    let contract: MotorcycleAssetContract;
    let ctx: TestContext;

    beforeEach(() => {
        contract = new MotorcycleAssetContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"motorcycle asset 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"motorcycle asset 1002 value"}'));
    });

    describe('#motorcycleAssetExists', () => {

        it('should return true for a motorcycle asset', async () => {
            await contract.motorcycleAssetExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a motorcycle asset that does not exist', async () => {
            await contract.motorcycleAssetExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createMotorcycleAsset', () => {

        it('should create a motorcycle asset', async () => {
            await contract.createMotorcycleAsset(ctx, '1003', 'motorcycle asset 1003 value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"motorcycle asset 1003 value"}'));
        });

        it('should throw an error for a motorcycle asset that already exists', async () => {
            await contract.createMotorcycleAsset(ctx, '1001', 'myvalue').should.be.rejectedWith(/The motorcycle asset 1001 already exists/);
        });

    });

    describe('#readMotorcycleAsset', () => {

        it('should return a motorcycle asset', async () => {
            await contract.readMotorcycleAsset(ctx, '1001').should.eventually.deep.equal({ value: 'motorcycle asset 1001 value' });
        });

        it('should throw an error for a motorcycle asset that does not exist', async () => {
            await contract.readMotorcycleAsset(ctx, '1003').should.be.rejectedWith(/The motorcycle asset 1003 does not exist/);
        });

    });

    describe('#updateMotorcycleAsset', () => {

        it('should update a motorcycle asset', async () => {
            await contract.updateMotorcycleAsset(ctx, '1001', 'motorcycle asset 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"motorcycle asset 1001 new value"}'));
        });

        it('should throw an error for a motorcycle asset that does not exist', async () => {
            await contract.updateMotorcycleAsset(ctx, '1003', 'motorcycle asset 1003 new value').should.be.rejectedWith(/The motorcycle asset 1003 does not exist/);
        });

    });

    describe('#deleteMotorcycleAsset', () => {

        it('should delete a motorcycle asset', async () => {
            await contract.deleteMotorcycleAsset(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a motorcycle asset that does not exist', async () => {
            await contract.deleteMotorcycleAsset(ctx, '1003').should.be.rejectedWith(/The motorcycle asset 1003 does not exist/);
        });

    });

});
