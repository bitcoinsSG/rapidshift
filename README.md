attn: this repo is in alpha mode, use at your own risk.

rapidshift (alpha v 0.0.7)
=====================

simple nodejs cli that converts between cryptocurrencies



installation 
=====================
#####fastest
```bash
sudo npm install -g rapidshift 
```

#####from source
```bash
git clone https://github.com/bitcoinsSG/rapidshift.git
cd rapidshift
npm install 
sudo npm link 
```

usage
=====================
```bash
rapidshift --refund <your refund address> --destination <your withdrawl address> --pair <symbolOfSourceCoin_symbolOfDestinatinCoin> --[other options]
```

#####examples


```bash
rapidshift --refund  12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX --destination 0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae--pair btc_eth


rapidshift --refund  1HLoD9E4SDFFPDiYfNYnkBLQ85Y51J3Zb1 --destination LSdTvMHRm8sScqwCi6x9wzYQae8JeZhx6y--pair btc_ltc --qrcode show
```

#####screenshot


![](http://i.imgur.com/blkWyqW.jpg)


help
=====================
```bash
rapidshift --help                                                                                                                                       

  Usage: rapidshift --refund <your refund address> --destination <your withdrawl address> --pair <symbolOfSourceCoin_symbolOfDestinatinCoin> --[other options] 


  example 1 : rapidshift --refund  12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX --destination 0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae --pair btc_eth 
  example 2 : rapidshift --refund  1HLoD9E4SDFFPDiYfNYnkBLQ85Y51J3Zb1 --destination LSdTvMHRm8sScqwCi6x9wzYQae8JeZhx6y --pair btc_ltc --qrcode show 


  Options:

    -h, --help                                          output usage information
    -V, --version                                       output the version number
    -d, --destination <required>              address where you want your funds sent after exchange.
    -r, --refund <required>                   your refund address incase anything goes wrong during an exchange
    -p, --pair <required>                     pair in conversion, using official symbols (e.g. bitcoin to ether; btc_eth, dash to ether; dash_eth)
    -x, --extra <optional>                    extra data required for special exchanges
    -q, --qrcode [show] <optional>            execute this if you want the qr codes to show up for payments
    -m, --minimum [amount in USD] <optional>  minimum threshold on USD exchanged
    -X, --mock [yes] <optional>               use this to run a fake/mock execution [for devs]

```

supports
=====================
![](https://shapeshift.io/images/coins/bitcoin.png) ![](https://shapeshift.io/images/coins/ether.png) ![](https://shapeshift.io/images/coins/ripple.png) ![](https://shapeshift.io/images/coins/litecoin.png) ![](https://shapeshift.io/images/coins/dash.png) ![](https://shapeshift.io/images/coins/maidsafe.png) ![](https://shapeshift.io/images/coins/dogecoin.png) ![](https://shapeshift.io/images/coins/monero.png)
![](https://shapeshift.io/images/coins/blackcoin.png) ![](https://shapeshift.io/images/coins/bitshares.png) ![](https://shapeshift.io/images/coins/bitcoindark.png) ![](https://shapeshift.io/images/coins/clams.png) ![](https://shapeshift.io/images/coins/counterparty.png) ![](https://shapeshift.io/images/coins/digibyte.png) ![](https://shapeshift.io/images/coins/emercoin.png) ![](https://shapeshift.io/images/coins/factoids.png) ![](https://shapeshift.io/images/coins/feathercoin.png) ![](https://shapeshift.io/images/coins/gemz.png) ![](https://shapeshift.io/images/coins/mastercoin.png) ![](https://shapeshift.io/images/coins/mintcoin.png) ![](https://shapeshift.io/images/coins/namecoin.png) ![](https://shapeshift.io/images/coins/nubits.png) ![](https://shapeshift.io/images/coins/nxt.png) ![](https://shapeshift.io/images/coins/novacoin.png) ![](https://shapeshift.io/images/coins/potcoin.png) ![](https://shapeshift.io/images/coins/peercoin.png) ![](https://shapeshift.io/images/coins/reddcoin.png) ![](https://shapeshift.io/images/coins/shadowcash.png) ![](https://shapeshift.io/images/coins/startcoin.png) ![](https://shapeshift.io/images/coins/storjcoinx.png)  ![](https://shapeshift.io/images/coins/unobtanium.png) ![](https://shapeshift.io/images/coins/vericoin.png) ![](https://shapeshift.io/images/coins/vertcoin.png) ![](https://shapeshift.io/images/coins/monacoin.png) ![](https://shapeshift.io/images/coins/stellar.png) ![](https://shapeshift.io/images/coins/florincoin.png) ![](https://shapeshift.io/images/coins/arch.png) ![](https://shapeshift.io/images/coins/bitcrystals.png) ![](https://shapeshift.io/images/coins/hyper.png)


requirements
=====================
nodejs 4.0 or later

license
=====================
standard MIT license

