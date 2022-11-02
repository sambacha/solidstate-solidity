import { PANIC_CODES } from '@nomicfoundation/hardhat-chai-matchers/panic';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { bnToBytes32, bnToAddress, bytes32ToNumber } from '@solidstate/library';
import {
  BinaryHeapAddressMock,
  BinaryHeapBytes32Mock,
  BinaryHeapUintMock,
  BinaryHeapAddressMock__factory,
  BinaryHeapBytes32Mock__factory,
  BinaryHeapUintMock__factory,
} from '@solidstate/typechain-types';
import { expect } from 'chai';
import { BigNumber } from 'ethers';
import { ethers } from 'hardhat';

const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => BigNumber.from(n));

const constants = {
  bytes32: numbers.map((n) => bnToBytes32(n)),
  address: numbers.map((n) => bnToAddress(n)),
  uint256: numbers,
};

// checks that the parent node is greater than or equal to the children nodes
function checkNodes(nodes: string[] | BigNumber[]) {
  nodes.forEach((node, index) => {
    const left = 2 * index + 1;
    const right = 2 * index + 2;

    if (nodes[left] != null) {
      expect(bytes32ToNumber(node)).to.be.greaterThanOrEqual(
        bytes32ToNumber(nodes[left]),
      );
    }

    if (nodes[right] != null) {
      expect(bytes32ToNumber(node)).to.be.greaterThanOrEqual(
        bytes32ToNumber(nodes[right]),
      );
    }
  });
}

describe('BinaryHeap', async () => {
  describe('Bytes32Heap', async () => {
    let instance: BinaryHeapBytes32Mock;
    let deployer: SignerWithAddress;

    beforeEach(async () => {
      [deployer] = await ethers.getSigners();
      instance = await new BinaryHeapBytes32Mock__factory(deployer).deploy();
    });

    describe('__internal', () => {
      describe('#at(uint256)', () => {
        it('returns the value corresponding to index provided', async () => {
          await instance['add(bytes32)'](constants.bytes32[0]);
          await instance['add(bytes32)'](constants.bytes32[1]);
          await instance['add(bytes32)'](constants.bytes32[2]);

          expect(await instance['at(uint256)'](0)).to.equal(
            constants.bytes32[2],
          );
          expect(await instance['at(uint256)'](1)).to.equal(
            constants.bytes32[0],
          );
          expect(await instance['at(uint256)'](2)).to.equal(
            constants.bytes32[1],
          );
        });

        describe('reverts if', function () {
          it('index out of bounds', async () => {
            await expect(instance['at(uint256)'](0)).to.be.revertedWithPanic(
              PANIC_CODES.ARRAY_ACCESS_OUT_OF_BOUNDS,
            );
          });
        });
      });

      describe('#contains(bytes32)', () => {
        it('returns true if the value has been added', async () => {
          await instance['add(bytes32)'](constants.bytes32[0]);
          await instance['add(bytes32)'](constants.bytes32[1]);
          await instance['add(bytes32)'](constants.bytes32[2]);

          expect(await instance['contains(bytes32)'](constants.bytes32[0])).to
            .be.true;
          expect(await instance['contains(bytes32)'](constants.bytes32[1])).to
            .be.true;
          expect(await instance['contains(bytes32)'](constants.bytes32[2])).to
            .be.true;
        });

        it('returns false if the value has not been added', async () => {
          expect(await instance['contains(bytes32)'](constants.bytes32[0])).to
            .be.false;
        });
      });

      describe('#indexOf(bytes32)', () => {
        it('returns index of the value', async () => {
          await instance['add(bytes32)'](constants.bytes32[0]);
          await instance['add(bytes32)'](constants.bytes32[1]);
          await instance['add(bytes32)'](constants.bytes32[2]);

          expect(
            await instance['indexOf(bytes32)'](constants.bytes32[0]),
          ).to.equal(1);
          expect(
            await instance['indexOf(bytes32)'](constants.bytes32[1]),
          ).to.equal(2);
          expect(
            await instance['indexOf(bytes32)'](constants.bytes32[2]),
          ).to.equal(0);

          await instance['remove(bytes32)'](constants.bytes32[0]);
          await instance['remove(bytes32)'](constants.bytes32[1]);
          await instance['remove(bytes32)'](constants.bytes32[2]);

          expect(
            await instance['indexOf(bytes32)'](constants.bytes32[0]),
          ).to.be.equal(ethers.constants.MaxUint256);

          expect(
            await instance['indexOf(bytes32)'](constants.bytes32[1]),
          ).to.be.equal(ethers.constants.MaxUint256);

          expect(
            await instance['indexOf(bytes32)'](constants.bytes32[2]),
          ).to.be.equal(ethers.constants.MaxUint256);
        });

        it('returns max uint256 if value does not exist', async () => {
          expect(
            await instance['indexOf(bytes32)'](constants.bytes32[0]),
          ).to.equal(ethers.constants.MaxUint256.toString());
        });
      });

      describe('#length()', () => {
        it('returns length of binary heap', async () => {
          expect(await instance['length()']()).to.equal(0);

          await instance['add(bytes32)'](constants.bytes32[0]);
          expect(await instance['length()']()).to.equal(1);

          await instance['add(bytes32)'](constants.bytes32[1]);
          expect(await instance['length()']()).to.equal(2);

          await instance['add(bytes32)'](constants.bytes32[2]);
          expect(await instance['length()']()).to.equal(3);

          await instance['remove(bytes32)'](constants.bytes32[2]);
          expect(await instance['length()']()).to.equal(2);

          await instance['remove(bytes32)'](constants.bytes32[1]);
          expect(await instance['length()']()).to.equal(1);

          await instance['remove(bytes32)'](constants.bytes32[0]);
          expect(await instance['length()']()).to.equal(0);
        });
      });

      describe('#root()', () => {
        it('returns the highest value in the heap', async () => {
          await instance['add(bytes32)'](constants.bytes32[0]);
          await instance['add(bytes32)'](constants.bytes32[1]);
          await instance['add(bytes32)'](constants.bytes32[2]);

          expect(await instance['root()']()).to.equal(constants.bytes32[2]);
        });

        it('returns the next highest value when the previous highest value is removed', async () => {
          await instance['add(bytes32)'](constants.bytes32[0]);
          await instance['add(bytes32)'](constants.bytes32[1]);
          await instance['add(bytes32)'](constants.bytes32[2]);

          await instance['remove(bytes32)'](constants.bytes32[2]);
          expect(await instance['root()']()).to.equal(constants.bytes32[1]);
        });

        describe('reverts if', function () {
          it('index out of bounds', async () => {
            await expect(instance['root()']()).to.be.revertedWithPanic(
              PANIC_CODES.ARRAY_ACCESS_OUT_OF_BOUNDS,
            );
          });
        });
      });

      describe('#add(bytes32)', () => {
        it('sets the parent node such that it is greater than or equal to the values of its children when a node is added', async () => {
          await instance['add(bytes32)'](constants.bytes32[2]);
          checkNodes(await instance['toArray()']());

          await instance['add(bytes32)'](constants.bytes32[0]);
          checkNodes(await instance['toArray()']());

          await instance['add(bytes32)'](constants.bytes32[8]);
          checkNodes(await instance['toArray()']());

          await instance['add(bytes32)'](constants.bytes32[3]);
          checkNodes(await instance['toArray()']());

          await instance['add(bytes32)'](constants.bytes32[6]);
          checkNodes(await instance['toArray()']());

          await instance['add(bytes32)'](constants.bytes32[4]);
          checkNodes(await instance['toArray()']());

          await instance['add(bytes32)'](constants.bytes32[5]);
          checkNodes(await instance['toArray()']());

          await instance['add(bytes32)'](constants.bytes32[9]);
          checkNodes(await instance['toArray()']());

          await instance['add(bytes32)'](constants.bytes32[7]);
          checkNodes(await instance['toArray()']());

          await instance['add(bytes32)'](constants.bytes32[1]);
          checkNodes(await instance['toArray()']());
        });

        it('returns true if value is added', async () => {
          expect(
            await instance.callStatic['add(bytes32)'](constants.bytes32[0]),
          ).to.be.true;
        });

        it('returns false if value has already been added', async () => {
          await instance['add(bytes32)'](constants.bytes32[0]);
          expect(
            await instance.callStatic['add(bytes32)'](constants.bytes32[0]),
          ).to.be.false;
        });
      });

      describe('#remove(bytes32)', () => {
        it('sets the parent node such that it is greater than or equal to the values of its children when a node is removed', async () => {
          await instance['add(bytes32)'](constants.bytes32[2]);
          await instance['add(bytes32)'](constants.bytes32[0]);
          await instance['add(bytes32)'](constants.bytes32[8]);
          await instance['add(bytes32)'](constants.bytes32[3]);
          await instance['add(bytes32)'](constants.bytes32[6]);
          await instance['add(bytes32)'](constants.bytes32[4]);
          await instance['add(bytes32)'](constants.bytes32[5]);
          await instance['add(bytes32)'](constants.bytes32[9]);
          await instance['add(bytes32)'](constants.bytes32[7]);
          await instance['add(bytes32)'](constants.bytes32[1]);

          await instance['remove(bytes32)'](constants.bytes32[6]);
          checkNodes(await instance['toArray()']());

          await instance['remove(bytes32)'](constants.bytes32[5]);
          checkNodes(await instance['toArray()']());

          await instance['remove(bytes32)'](constants.bytes32[8]);
          checkNodes(await instance['toArray()']());

          await instance['remove(bytes32)'](constants.bytes32[2]);
          checkNodes(await instance['toArray()']());

          await instance['remove(bytes32)'](constants.bytes32[4]);
          checkNodes(await instance['toArray()']());

          await instance['remove(bytes32)'](constants.bytes32[0]);
          checkNodes(await instance['toArray()']());

          await instance['remove(bytes32)'](constants.bytes32[3]);
          checkNodes(await instance['toArray()']());

          await instance['remove(bytes32)'](constants.bytes32[9]);
          checkNodes(await instance['toArray()']());

          await instance['remove(bytes32)'](constants.bytes32[1]);
          checkNodes(await instance['toArray()']());

          await instance['remove(bytes32)'](constants.bytes32[7]);
          checkNodes(await instance['toArray()']());
        });

        it('returns true if value is removed', async () => {
          await instance['add(bytes32)'](constants.bytes32[0]);
          await instance['add(bytes32)'](constants.bytes32[1]);
          await instance['add(bytes32)'](constants.bytes32[2]);

          expect(
            await instance.callStatic['remove(bytes32)'](constants.bytes32[0]),
          ).to.be.true;
        });

        it('returns false if value does not exist', async () => {
          expect(
            await instance.callStatic['remove(bytes32)'](constants.bytes32[0]),
          ).to.be.false;
        });
      });

      describe('#toArray()', () => {
        it('returns the max heap as an array', async () => {
          await instance['add(bytes32)'](constants.bytes32[0]);
          await instance['add(bytes32)'](constants.bytes32[1]);
          await instance['add(bytes32)'](constants.bytes32[2]);

          const array = await instance.callStatic['toArray()']();

          expect(array.length).to.equal(3);

          expect(array).to.deep.equal([
            constants.bytes32[2],
            constants.bytes32[0],
            constants.bytes32[1],
          ]);
        });
      });
    });
  });

  describe('AddressHeap', async () => {
    let instance: BinaryHeapAddressMock;
    let deployer: SignerWithAddress;

    beforeEach(async () => {
      [deployer] = await ethers.getSigners();
      instance = await new BinaryHeapAddressMock__factory(deployer).deploy();
    });

    describe('__internal', () => {
      describe('#at(uint256)', () => {
        it('returns the value corresponding to index provided', async () => {
          await instance['add(address)'](constants.address[0]);
          await instance['add(address)'](constants.address[1]);
          await instance['add(address)'](constants.address[2]);

          expect(await instance['at(uint256)'](0)).to.equal(
            constants.address[2],
          );
          expect(await instance['at(uint256)'](1)).to.equal(
            constants.address[0],
          );
          expect(await instance['at(uint256)'](2)).to.equal(
            constants.address[1],
          );
        });

        describe('reverts if', function () {
          it('index out of bounds', async () => {
            await expect(instance['at(uint256)'](0)).to.be.revertedWithPanic(
              PANIC_CODES.ARRAY_ACCESS_OUT_OF_BOUNDS,
            );
          });
        });
      });

      describe('#contains(address)', () => {
        it('returns true if the value has been added', async () => {
          await instance['add(address)'](constants.address[0]);
          await instance['add(address)'](constants.address[1]);
          await instance['add(address)'](constants.address[2]);

          expect(await instance['contains(address)'](constants.address[0])).to
            .be.true;
          expect(await instance['contains(address)'](constants.address[1])).to
            .be.true;
          expect(await instance['contains(address)'](constants.address[2])).to
            .be.true;
        });

        it('returns false if the value has not been added', async () => {
          expect(await instance['contains(address)'](constants.address[0])).to
            .be.false;
        });
      });

      describe('#indexOf(address)', () => {
        it('returns index of the value', async () => {
          await instance['add(address)'](constants.address[0]);
          await instance['add(address)'](constants.address[1]);
          await instance['add(address)'](constants.address[2]);

          expect(
            await instance['indexOf(address)'](constants.address[0]),
          ).to.equal(1);
          expect(
            await instance['indexOf(address)'](constants.address[1]),
          ).to.equal(2);
          expect(
            await instance['indexOf(address)'](constants.address[2]),
          ).to.equal(0);

          await instance['remove(address)'](constants.address[0]);
          await instance['remove(address)'](constants.address[1]);
          await instance['remove(address)'](constants.address[2]);

          expect(
            await instance['indexOf(address)'](constants.address[0]),
          ).to.be.equal(ethers.constants.MaxUint256);

          expect(
            await instance['indexOf(address)'](constants.address[1]),
          ).to.be.equal(ethers.constants.MaxUint256);

          expect(
            await instance['indexOf(address)'](constants.address[2]),
          ).to.be.equal(ethers.constants.MaxUint256);
        });

        it('returns max uint256 if value does not exist', async () => {
          expect(
            await instance['indexOf(address)'](constants.address[0]),
          ).to.equal(ethers.constants.MaxUint256.toString());
        });
      });

      describe('#length()', () => {
        it('returns length of binary heap', async () => {
          expect(await instance['length()']()).to.equal(0);

          await instance['add(address)'](constants.address[0]);
          expect(await instance['length()']()).to.equal(1);

          await instance['add(address)'](constants.address[1]);
          expect(await instance['length()']()).to.equal(2);

          await instance['add(address)'](constants.address[2]);
          expect(await instance['length()']()).to.equal(3);

          await instance['remove(address)'](constants.address[2]);
          expect(await instance['length()']()).to.equal(2);

          await instance['remove(address)'](constants.address[1]);
          expect(await instance['length()']()).to.equal(1);

          await instance['remove(address)'](constants.address[0]);
          expect(await instance['length()']()).to.equal(0);
        });
      });

      describe('#root()', () => {
        it('returns the highest value in the heap', async () => {
          await instance['add(address)'](constants.address[0]);
          await instance['add(address)'](constants.address[1]);
          await instance['add(address)'](constants.address[2]);

          expect(await instance['root()']()).to.equal(constants.address[2]);
        });

        it('returns the next highest value when the previous highest value is removed', async () => {
          await instance['add(address)'](constants.address[0]);
          await instance['add(address)'](constants.address[1]);
          await instance['add(address)'](constants.address[2]);

          await instance['remove(address)'](constants.address[2]);
          expect(await instance['root()']()).to.equal(constants.address[1]);
        });

        describe('reverts if', function () {
          it('index out of bounds', async () => {
            await expect(instance['root()']()).to.be.revertedWithPanic(
              PANIC_CODES.ARRAY_ACCESS_OUT_OF_BOUNDS,
            );
          });
        });
      });

      describe('#add(address)', () => {
        it('sets the parent node such that it is greater than or equal to the values of its children when a node is added', async () => {
          await instance['add(address)'](constants.address[2]);
          checkNodes(await instance['toArray()']());

          await instance['add(address)'](constants.address[0]);
          checkNodes(await instance['toArray()']());

          await instance['add(address)'](constants.address[8]);
          checkNodes(await instance['toArray()']());

          await instance['add(address)'](constants.address[3]);
          checkNodes(await instance['toArray()']());

          await instance['add(address)'](constants.address[6]);
          checkNodes(await instance['toArray()']());

          await instance['add(address)'](constants.address[4]);
          checkNodes(await instance['toArray()']());

          await instance['add(address)'](constants.address[5]);
          checkNodes(await instance['toArray()']());

          await instance['add(address)'](constants.address[9]);
          checkNodes(await instance['toArray()']());

          await instance['add(address)'](constants.address[7]);
          checkNodes(await instance['toArray()']());

          await instance['add(address)'](constants.address[1]);
          checkNodes(await instance['toArray()']());
        });

        it('returns true if value is added', async () => {
          expect(
            await instance.callStatic['add(address)'](constants.address[0]),
          ).to.be.true;
        });

        it('returns false if value has already been added', async () => {
          await instance['add(address)'](constants.address[0]);
          expect(
            await instance.callStatic['add(address)'](constants.address[0]),
          ).to.be.false;
        });
      });

      describe('#remove(address)', () => {
        it('sets the parent node such that it is greater than or equal to the values of its children when a node is removed', async () => {
          await instance['add(address)'](constants.address[2]);
          await instance['add(address)'](constants.address[0]);
          await instance['add(address)'](constants.address[8]);
          await instance['add(address)'](constants.address[3]);
          await instance['add(address)'](constants.address[6]);
          await instance['add(address)'](constants.address[4]);
          await instance['add(address)'](constants.address[5]);
          await instance['add(address)'](constants.address[9]);
          await instance['add(address)'](constants.address[7]);
          await instance['add(address)'](constants.address[1]);

          await instance['remove(address)'](constants.address[6]);
          checkNodes(await instance['toArray()']());

          await instance['remove(address)'](constants.address[5]);
          checkNodes(await instance['toArray()']());

          await instance['remove(address)'](constants.address[8]);
          checkNodes(await instance['toArray()']());

          await instance['remove(address)'](constants.address[2]);
          checkNodes(await instance['toArray()']());

          await instance['remove(address)'](constants.address[4]);
          checkNodes(await instance['toArray()']());

          await instance['remove(address)'](constants.address[0]);
          checkNodes(await instance['toArray()']());

          await instance['remove(address)'](constants.address[3]);
          checkNodes(await instance['toArray()']());

          await instance['remove(address)'](constants.address[9]);
          checkNodes(await instance['toArray()']());

          await instance['remove(address)'](constants.address[1]);
          checkNodes(await instance['toArray()']());

          await instance['remove(address)'](constants.address[7]);
          checkNodes(await instance['toArray()']());
        });

        it('returns true if value is removed', async () => {
          await instance['add(address)'](constants.address[0]);
          await instance['add(address)'](constants.address[1]);
          await instance['add(address)'](constants.address[2]);

          expect(
            await instance.callStatic['remove(address)'](constants.address[0]),
          ).to.be.true;
        });

        it('returns false if value does not exist', async () => {
          expect(
            await instance.callStatic['remove(address)'](constants.address[0]),
          ).to.be.false;
        });
      });

      describe('#toArray()', () => {
        it('returns the max heap as an array', async () => {
          await instance['add(address)'](constants.address[0]);
          await instance['add(address)'](constants.address[1]);
          await instance['add(address)'](constants.address[2]);

          const array = await instance.callStatic['toArray()']();

          expect(array.length).to.equal(3);

          expect(array).to.deep.equal([
            constants.address[2],
            constants.address[0],
            constants.address[1],
          ]);
        });
      });
    });
  });

  describe('UintHeap', async () => {
    let instance: BinaryHeapUintMock;
    let deployer: SignerWithAddress;

    beforeEach(async () => {
      [deployer] = await ethers.getSigners();
      instance = await new BinaryHeapUintMock__factory(deployer).deploy();
    });

    describe('__internal', () => {
      describe('#at(uint256)', () => {
        it('returns the value corresponding to index provided', async () => {
          await instance['add(uint256)'](constants.uint256[0]);
          await instance['add(uint256)'](constants.uint256[1]);
          await instance['add(uint256)'](constants.uint256[2]);

          expect(await instance['at(uint256)'](0)).to.equal(
            constants.uint256[2],
          );
          expect(await instance['at(uint256)'](1)).to.equal(
            constants.uint256[0],
          );
          expect(await instance['at(uint256)'](2)).to.equal(
            constants.uint256[1],
          );
        });

        describe('reverts if', function () {
          it('index out of bounds', async () => {
            await expect(instance['at(uint256)'](0)).to.be.revertedWithPanic(
              PANIC_CODES.ARRAY_ACCESS_OUT_OF_BOUNDS,
            );
          });
        });
      });

      describe('#contains(uint256)', () => {
        it('returns true if the value has been added', async () => {
          await instance['add(uint256)'](constants.uint256[0]);
          await instance['add(uint256)'](constants.uint256[1]);
          await instance['add(uint256)'](constants.uint256[2]);

          expect(await instance['contains(uint256)'](constants.uint256[0])).to
            .be.true;
          expect(await instance['contains(uint256)'](constants.uint256[1])).to
            .be.true;
          expect(await instance['contains(uint256)'](constants.uint256[2])).to
            .be.true;
        });

        it('returns false if the value has not been added', async () => {
          expect(await instance['contains(uint256)'](constants.uint256[0])).to
            .be.false;
        });
      });

      describe('#indexOf(uint256)', () => {
        it('returns index of the value', async () => {
          await instance['add(uint256)'](constants.uint256[0]);
          await instance['add(uint256)'](constants.uint256[1]);
          await instance['add(uint256)'](constants.uint256[2]);

          expect(
            await instance['indexOf(uint256)'](constants.uint256[0]),
          ).to.equal(1);
          expect(
            await instance['indexOf(uint256)'](constants.uint256[1]),
          ).to.equal(2);
          expect(
            await instance['indexOf(uint256)'](constants.uint256[2]),
          ).to.equal(0);

          await instance['remove(uint256)'](constants.uint256[0]);
          await instance['remove(uint256)'](constants.uint256[1]);
          await instance['remove(uint256)'](constants.uint256[2]);

          expect(
            await instance['indexOf(uint256)'](constants.uint256[0]),
          ).to.be.equal(ethers.constants.MaxUint256);

          expect(
            await instance['indexOf(uint256)'](constants.uint256[1]),
          ).to.be.equal(ethers.constants.MaxUint256);

          expect(
            await instance['indexOf(uint256)'](constants.uint256[2]),
          ).to.be.equal(ethers.constants.MaxUint256);
        });

        it('returns max uint256 if value does not exist', async () => {
          expect(
            await instance['indexOf(uint256)'](constants.uint256[0]),
          ).to.equal(ethers.constants.MaxUint256.toString());
        });
      });

      describe('#length()', () => {
        it('returns length of binary heap', async () => {
          expect(await instance['length()']()).to.equal(0);

          await instance['add(uint256)'](constants.uint256[0]);
          expect(await instance['length()']()).to.equal(1);

          await instance['add(uint256)'](constants.uint256[1]);
          expect(await instance['length()']()).to.equal(2);

          await instance['add(uint256)'](constants.uint256[2]);
          expect(await instance['length()']()).to.equal(3);

          await instance['remove(uint256)'](constants.uint256[2]);
          expect(await instance['length()']()).to.equal(2);

          await instance['remove(uint256)'](constants.uint256[1]);
          expect(await instance['length()']()).to.equal(1);

          await instance['remove(uint256)'](constants.uint256[0]);
          expect(await instance['length()']()).to.equal(0);
        });
      });

      describe('#root()', () => {
        it('returns the highest value in the heap', async () => {
          await instance['add(uint256)'](constants.uint256[0]);
          await instance['add(uint256)'](constants.uint256[1]);
          await instance['add(uint256)'](constants.uint256[2]);

          expect(await instance['root()']()).to.equal(constants.uint256[2]);
        });

        it('returns the next highest value when the previous highest value is removed', async () => {
          await instance['add(uint256)'](constants.uint256[0]);
          await instance['add(uint256)'](constants.uint256[1]);
          await instance['add(uint256)'](constants.uint256[2]);

          await instance['remove(uint256)'](constants.uint256[2]);
          expect(await instance['root()']()).to.equal(constants.uint256[1]);
        });

        describe('reverts if', function () {
          it('index out of bounds', async () => {
            await expect(instance['root()']()).to.be.revertedWithPanic(
              PANIC_CODES.ARRAY_ACCESS_OUT_OF_BOUNDS,
            );
          });
        });
      });

      describe('#add(uint256)', () => {
        it('sets the parent node such that it is greater than or equal to the values of its children when a node is added', async () => {
          await instance['add(uint256)'](constants.uint256[2]);
          checkNodes(await instance['toArray()']());

          await instance['add(uint256)'](constants.uint256[0]);
          checkNodes(await instance['toArray()']());

          await instance['add(uint256)'](constants.uint256[8]);
          checkNodes(await instance['toArray()']());

          await instance['add(uint256)'](constants.uint256[3]);
          checkNodes(await instance['toArray()']());

          await instance['add(uint256)'](constants.uint256[6]);
          checkNodes(await instance['toArray()']());

          await instance['add(uint256)'](constants.uint256[4]);
          checkNodes(await instance['toArray()']());

          await instance['add(uint256)'](constants.uint256[5]);
          checkNodes(await instance['toArray()']());

          await instance['add(uint256)'](constants.uint256[9]);
          checkNodes(await instance['toArray()']());

          await instance['add(uint256)'](constants.uint256[7]);
          checkNodes(await instance['toArray()']());

          await instance['add(uint256)'](constants.uint256[1]);
          checkNodes(await instance['toArray()']());
        });

        it('returns true if value is added', async () => {
          expect(
            await instance.callStatic['add(uint256)'](constants.uint256[0]),
          ).to.be.true;
        });

        it('returns false if value has already been added', async () => {
          await instance['add(uint256)'](constants.uint256[0]);
          expect(
            await instance.callStatic['add(uint256)'](constants.uint256[0]),
          ).to.be.false;
        });
      });

      describe('#remove(uint256)', () => {
        it('sets the parent node such that it is greater than or equal to the values of its children when a node is removed', async () => {
          await instance['add(uint256)'](constants.uint256[2]);
          await instance['add(uint256)'](constants.uint256[0]);
          await instance['add(uint256)'](constants.uint256[8]);
          await instance['add(uint256)'](constants.uint256[3]);
          await instance['add(uint256)'](constants.uint256[6]);
          await instance['add(uint256)'](constants.uint256[4]);
          await instance['add(uint256)'](constants.uint256[5]);
          await instance['add(uint256)'](constants.uint256[9]);
          await instance['add(uint256)'](constants.uint256[7]);
          await instance['add(uint256)'](constants.uint256[1]);

          await instance['remove(uint256)'](constants.uint256[6]);
          checkNodes(await instance['toArray()']());

          await instance['remove(uint256)'](constants.uint256[5]);
          checkNodes(await instance['toArray()']());

          await instance['remove(uint256)'](constants.uint256[8]);
          checkNodes(await instance['toArray()']());

          await instance['remove(uint256)'](constants.uint256[2]);
          checkNodes(await instance['toArray()']());

          await instance['remove(uint256)'](constants.uint256[4]);
          checkNodes(await instance['toArray()']());

          await instance['remove(uint256)'](constants.uint256[0]);
          checkNodes(await instance['toArray()']());

          await instance['remove(uint256)'](constants.uint256[3]);
          checkNodes(await instance['toArray()']());

          await instance['remove(uint256)'](constants.uint256[9]);
          checkNodes(await instance['toArray()']());

          await instance['remove(uint256)'](constants.uint256[1]);
          checkNodes(await instance['toArray()']());

          await instance['remove(uint256)'](constants.uint256[7]);
          checkNodes(await instance['toArray()']());
        });

        it('returns true if value is removed', async () => {
          await instance['add(uint256)'](constants.uint256[0]);
          await instance['add(uint256)'](constants.uint256[1]);
          await instance['add(uint256)'](constants.uint256[2]);

          expect(
            await instance.callStatic['remove(uint256)'](constants.uint256[0]),
          ).to.be.true;
        });

        it('returns false if value does not exist', async () => {
          expect(
            await instance.callStatic['remove(uint256)'](constants.uint256[0]),
          ).to.be.false;
        });
      });

      describe('#toArray()', () => {
        it('returns the max heap as an array', async () => {
          await instance['add(uint256)'](constants.uint256[0]);
          await instance['add(uint256)'](constants.uint256[1]);
          await instance['add(uint256)'](constants.uint256[2]);

          const array = await instance.callStatic['toArray()']();

          expect(array.length).to.equal(3);

          expect(array).to.deep.equal([
            constants.uint256[2],
            constants.uint256[0],
            constants.uint256[1],
          ]);
        });
      });
    });
  });
});
