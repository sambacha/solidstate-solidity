const { expect } = require('chai');

const describeBehaviorOfERC1155Base = require('./ERC1155Base.behavior.js');

describe('ERC1155Base', function () {
  let holder;
  let instance;
  let invalidReceiver;

  before(async function () {
    [holder] = await ethers.getSigners();
  });

  beforeEach(async function () {
    const factory = await ethers.getContractFactory('ERC1155BaseMock');
    instance = await factory.deploy();
    await instance.deployed();
    invalidReceiver = instance;
  });

  // eslint-disable-next-line mocha/no-setup-in-describe
  describeBehaviorOfERC1155Base({
    deploy: () => instance,
    mint: (recipient, tokenId, amount) => instance.mint(recipient, tokenId, amount),
    burn: (recipient, tokenId, amount) => instance.burn(recipient, tokenId, amount),
  }, []);

  describe('__internal', function () {
    describe('#_mint', function () {
      it('increases balance of given token held by given account by given amount', async function () {
        let id = ethers.constants.Zero;
        let amount = ethers.constants.Two;

        let initialBalance = await instance['balanceOf(address,uint256)'](holder.address, id);

        await instance['mint(address,uint256,uint256)'](
          holder.address,
          id,
          amount,
          ethers.utils.randomBytes(0)
        );

        let finalBalance = await instance['balanceOf(address,uint256)'](holder.address, id);

        expect(finalBalance.sub(initialBalance)).to.equal(amount);
      });

      it('emits TransferSingle event', async function () {
        let id = ethers.constants.Zero;
        let amount = ethers.constants.Two;

        await expect(
          instance.connect(holder)['mint(address,uint256,uint256)'](
            holder.address,
            id,
            amount,
            ethers.utils.randomBytes(0)
          )
        ).to.emit(
          instance, 'TransferSingle'
        ).withArgs(
          holder.address,
          ethers.constants.AddressZero,
          holder.address,
          id,
          amount
        );
      });

      describe('reverts if', function () {
        it('mint is made to the zero address', async function () {
          await expect(
            instance['mint(address,uint256,uint256)'](
              ethers.constants.AddressZero,
              ethers.constants.Zero,
              ethers.constants.Zero,
              ethers.utils.randomBytes(0)
            )
          ).to.be.revertedWith(
            'ERC1155: mint to the zero address'
          );
        });

        it('mint is made to invalid receiver', async function () {
          await expect(
            instance['mint(address,uint256,uint256)'](
              invalidReceiver.address,
              ethers.constants.Zero,
              ethers.constants.Zero,
              ethers.utils.randomBytes(0)
            )
          ).to.be.revertedWith(
            'ERC1155: transfer to non ERC1155Receiver implementer'
          );
        });
      });
    });

    describe('#_mintBatch', function () {
      it('increases balances of given tokens held by given account by given amounts', async function () {
        let id = ethers.constants.Zero;
        let amount = ethers.constants.Two;

        let initialBalance = await instance['balanceOf(address,uint256)'](holder.address, id);

        await instance['mintBatch(address,uint256[],uint256[])'](
          holder.address,
          [id],
          [amount],
          ethers.utils.randomBytes(0)
        );

        let finalBalance = await instance['balanceOf(address,uint256)'](holder.address, id);

        expect(finalBalance.sub(initialBalance)).to.equal(amount);
      });

      it('emits TransferBatch event', async function () {
        let id = ethers.constants.Zero;
        let amount = ethers.constants.Two;

        await expect(
          instance.connect(holder)['mintBatch(address,uint256[],uint256[])'](
            holder.address,
            [id],
            [amount],
            ethers.utils.randomBytes(0)
          )
        ).to.emit(
          instance, 'TransferBatch'
        ).withArgs(
          holder.address,
          ethers.constants.AddressZero,
          holder.address,
          [id],
          [amount]
        );
      });

      describe('reverts if', function () {
        it('mint is made to the zero address', async function () {
          await expect(
            instance['mintBatch(address,uint256[],uint256[])'](
              ethers.constants.AddressZero,
              [],
              [],
              ethers.utils.randomBytes(0)
            )
          ).to.be.revertedWith(
            'ERC1155: mint to the zero address'
          );
        });

        it('input array lengths do not match', async function () {
          await expect(
            instance['mintBatch(address,uint256[],uint256[])'](
              holder.address,
              [ethers.constants.Zero],
              [],
              ethers.utils.randomBytes(0)
            )
          ).to.be.revertedWith(
            'ERC1155: ids and amounts length mismatch'
          );
        });

        it('mint is made to invalid receiver', async function () {
          await expect(
            instance['mintBatch(address,uint256[],uint256[])'](
              instance.address,
              [],
              [],
              ethers.utils.randomBytes(0)
            )
          ).to.be.revertedWith(
            'ERC1155: transfer to non ERC1155Receiver implementer'
          );
        });
      });
    });

    describe('#_burn',  function () {
      it('decreases balance of given token held by given account by given amount', async function () {
        let id = ethers.constants.Zero;
        let amount = ethers.constants.Two;

        await instance['mint(address,uint256,uint256)'](
          holder.address,
          id,
          amount,
          ethers.utils.randomBytes(0)
        );

        let initialBalance = await instance['balanceOf(address,uint256)'](holder.address, id);

        await instance['burn(address,uint256,uint256)'](
          holder.address,
          id,
          amount
        );

        let finalBalance = await instance['balanceOf(address,uint256)'](holder.address, id);

        expect(initialBalance.sub(finalBalance)).to.equal(amount);
      });

      it('emits TransferSingle event', async function () {
        let id = ethers.constants.Zero;
        let amount = ethers.constants.Two;

        await instance['mint(address,uint256,uint256)'](
          holder.address,
          id,
          amount,
          ethers.utils.randomBytes(0)
        );

        await expect(
          instance.connect(holder)['burn(address,uint256,uint256)'](
            holder.address,
            id,
            amount
          )
        ).to.emit(
          instance, 'TransferSingle'
        ).withArgs(
          holder.address,
          holder.address,
          ethers.constants.AddressZero,
          id,
          amount
        );
      });

      describe('reverts if', function () {
        it('burn is made from the zero address', async function () {
          await expect(
            instance['burn(address,uint256,uint256)'](
              ethers.constants.AddressZero,
              ethers.constants.Zero,
              ethers.constants.Zero
            )
          ).to.be.revertedWith(
            'ERC1155: burn from the zero address'
          );
        });

        it('burn amount exceeds balance', async function () {
          await expect(
            instance['burn(address,uint256,uint256)'](
              holder.address,
              ethers.constants.Zero,
              ethers.constants.One
            )
          ).to.be.revertedWith(
            'ERC1155: burn amount exceeds balance'
          );
        });
      });
    });

    describe('#_burnBatch', function () {
      it('decreases balances of given tokens held by given account by given amounts', async function () {
        let id = ethers.constants.Zero;
        let amount = ethers.constants.Two;

        await instance['mint(address,uint256,uint256)'](
          holder.address,
          id,
          amount,
          ethers.utils.randomBytes(0)
        );

        let initialBalance = await instance['balanceOf(address,uint256)'](holder.address, id);

        await instance['burnBatch(address,uint256[],uint256[])'](
          holder.address,
          [id],
          [amount]
        );

        let finalBalance = await instance['balanceOf(address,uint256)'](holder.address, id);

        expect(initialBalance.sub(finalBalance)).to.equal(amount);
      });

      it('emits TransferBatch event', async function () {
        let id = ethers.constants.Zero;
        let amount = ethers.constants.Two;

        await instance['mintBatch(address,uint256[],uint256[])'](
          holder.address,
          [id],
          [amount],
          ethers.utils.randomBytes(0)
        );

        await expect(
          instance.connect(holder)['burnBatch(address,uint256[],uint256[])'](
            holder.address,
            [id],
            [amount]
          )
        ).to.emit(
          instance, 'TransferBatch'
        ).withArgs(
          holder.address,
          holder.address,
          ethers.constants.AddressZero,
          [id],
          [amount]
        );
      });

      describe('reverts if', function () {
        it('burn is made from the zero address', async function () {
          await expect(
            instance['burnBatch(address,uint256[],uint256[])'](
              ethers.constants.AddressZero,
              [],
              []
            )
          ).to.be.revertedWith(
            'ERC1155: burn from the zero address'
          );
        });

        it('input array lengths do not match', async function () {
          await expect(
            instance['burnBatch(address,uint256[],uint256[])'](
              holder.address,
              [ethers.constants.Zero],
              []
            )
          ).to.be.revertedWith(
            'ERC1155: ids and amounts length mismatch'
          );
        });

        it('burn amount exceeds balance', async function () {
          await expect(
            instance['burnBatch(address,uint256[],uint256[])'](
              holder.address,
              [ethers.constants.Zero],
              [ethers.constants.One]
            )
          ).to.be.revertedWith(
            'ERC1155: burn amount exceeds balance'
          );
        });
      });
    });

    describe('#_transfer', function () {
      it('todo');
    });

    describe('#_transferBatch', function () {
      it('todo');
    });

    describe('#_beforeTokenTransfer', function () {
      it('todo');
    });
  });
});
