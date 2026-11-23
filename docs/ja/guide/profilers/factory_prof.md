# FactoryProf

FactoryProf は、ファクトリの使用状況の統計、つまり各ファクトリがどれだけ使われたかを追跡します。

出力例:

```sh
[TEST PROF INFO] Factories usage

Total: 15285
Total top-level: 10286
Total time: 04:31.222 (out of 07.16.124)
Total uniq factories: 119

   name           total   top-level   total time    time per call      top-level time

   user            6091        2715    115.7671s          0.0426s            50.2517s
   post            2142        2098     93.3152s          0.0444s            92.1915s
   ...
```

ファクトリの実行回数の合計と、_トップレベル_ での実行回数、つまり別のファクトリの呼び出しの最中 (関連を使う場合など) ではない実行の回数の両方が表示されます。

また、ファクトリでのレコード生成に費やした時間と、ファクトリの呼び出し 1 回あたりの所要時間も表示されます。

**注意**: FactoryProf が追跡するのは、レコードをデータベースに永続化するファクトリの呼び出しのみです。FactoryBot の場合は `create` ストラテジー、Fabrication の場合は `create` メソッドで作られるオブジェクトが該当します。

## 使い方

FactoryProf は FactoryBot と Fabrication のどちらでも使用できます。アプリケーションに両方の gem が同時に入っていても構いません。

FactoryProf を有効にするには、環境変数 `FPROF` を使用します。

```sh
# シンプルなプロファイラ
FPROF=1 rspec

# または
FPROF=1 bundle exec rake test
```

### [_Nate Heckler_](https://twitter.com/nateberkopec/status/1389945187766456333) モード

できるだけ早くファクトリを直す気になってもらうために、特別な _Nate heckler_ モードも用意しています。

次の 1 行を `rails_helper.rb` または `test_helper.rb` に追加してください。

```ruby
require "test_prof/factory_prof/nate_heckler"
```

すると、テストを実行するたびにファクトリ全体の使用状況が表示されます。

```sh
[TEST PROF INFO] Time spent in factories: 04:31.222 (54% of total time)
```

### バリエーション

環境変数 `FPROF_VARS=1` を指定するか、コードで有効にすることで、_バリエーション_ (trait やオーバーライドなど) の情報をレポートに追加することもできます。

```ruby
TestProf::FactoryProf.configure do |config|
  config.include_variations = true
end
```

たとえば次のようになります。

```sh
$ FPROF=1 FPROF_VARS=1 bin/rails test

...

[TEST PROF INFO] Factories usage

Total: 15285
Total top-level: 10286
Total time: 04:31.222 (out of 07.16.124)
Total uniq factories: 119

   name           total   top-level   total time    time per call      top-level time

   user            6091        2715    115.7671s          0.0426s             50.251s
     -             5243        1989      84.231s          0.0412s             34.321s
     .admin         823         715      15.767s          0.0466s              5.257s
     [name,role]     25          11       7.671s          0.0666s              1.257s
   post            2142        2098      93.315s          0.0444s             92.191s
     _             2130        2086      87.685s          0.0412s             88.191s
     .draft[tags]    12          12       9.315s           0.164s             42.115s
   ...
```

上の例では、`-` は trait もオーバーライドもないファクトリ (例: `create(:user)`)、`.xxx` は trait、`[a,b]` はオーバーライドのキーを表します。たとえば `create(:user, :admin)` は `.admin` というバリエーションになり、`create(:post, :draft, tags: ["a"])` は `.draft[tags]` になります。

#### バリエーションの上限の設定

FactoryProf を実行すると、長すぎるバリエーションが出力に含まれ、表示が崩れることがあります。

これを避けて最も重要な統計に集中するために、バリエーションの上限値を指定できます。trait やオーバーライドの数が上限を超えるバリエーションは、代わりに特別な ID (`[...]`) で表示されます。

バリエーションの上限パラメータを使うには、環境変数 `FPROF_VARIATIONS_LIMIT` に `N` を設定します (`N` は上限の数です)。

```sh
FPROF=1 FPROF_VARIATIONS_LIMIT=5 rspec

# または
FPROF=1 FPROF_VARIATIONS_LIMIT=5 bundle exec rake test
```

あるいは、`FactoryProf` の設定で上限のパラメータを指定することもできます。

```ruby
TestProf::FactoryProf.configure do |config|
  config.variations_limit = 5
end
```

### プロファイル結果を JSON ファイルに書き出す

FactoryProf は、プロファイル結果を JSON ファイルとして保存できます。

この機能を使うには、環境変数 `FPROF` に `json` を設定します。

```sh
FPROF=json rspec

# または
FPROF=json bundle exec rake test
```

出力例:

```sh
[TEST PROF INFO] Profile results to JSON: tmp/test_prof/test-prof.result.json
```

### 出力を減らす

FactoryProf を実行すると、数回しか使われていないファクトリの行が出力に大量に含まれることがあります。
これを避けて最も重要な統計に集中するために、しきい値を指定できます。すると、合計回数がしきい値を超えるファクトリだけが表示されます。

しきい値のオプションを使うには、環境変数 `FPROF_THRESHOLD` に `N` を設定します (`N` はしきい値の数です)。

```sh
FPROF=1 FPROF_THRESHOLD=30 rspec

# または
FPROF=1 FPROF_THRESHOLD=30 bundle exec rake test
```

あるいは、`FactoryProf` の設定でしきい値のパラメータを指定することもできます。

```ruby
TestProf::FactoryProf.configure do |config|
  config.threshold = 30
end
```

### 長いファクトリ名を切り詰める

ファクトリ名が長いコードベースで FactoryProf を実行すると、表のレイアウトが崩れることがあります。これを避けるために、FactoryProf に名前を切り詰めさせることができます。

切り詰めを使うには、環境変数 `FPROF_TRUNCATE_NAMES` に `1` を設定します。

```sh
FPROF=1 FPROF_TRUNCATE_NAMES=1 rspec

# または
FPROF=1 FPROF_TRUNCATE_NAMES=1 bundle exec rake test
```

あるいは、`FactoryProf` の設定で truncate_names パラメータを指定することもできます。

```ruby
TestProf::FactoryProf.configure do |config|
  config.truncate_names = true
end
```

## ファクトリのフレームグラフ

FactoryProf の最も便利な機能が _FactoryFlame_ レポートです。これは Brendan Gregg の[フレームグラフ](http://www.brendangregg.com/flamegraphs.html)を独自に解釈したもので、_ファクトリカスケード_ を特定できます。

FactoryFlame レポートを生成するには、環境変数 `FPROF` に `flamegraph` を設定します。

```sh
FPROF=flamegraph rspec

# または
FPROF=flamegraph bundle exec rake test
```

レポートは次のような見た目になります。

<img alt="TagProf UI" data-origin="/assets/factory-flame.gif" src="/assets/factory-flame.gif">

これはどう読めばよいのでしょうか？

それぞれの列は _ファクトリスタック_ または _カスケード_、つまり `#create` メソッドの再帰的な呼び出しの連なりを表します。次の例を考えてみましょう。

```ruby
factory :comment do
  answer
  author
end

factory :answer do
  question
  author
end

factory :question do
  author
end

create(:comment) #=> 5 件のレコードを作成する

# 対応するスタックは次のとおり:
# [:comment, :answer, :question, :author, :author, :author]
```

列の幅が広いほど、そのスタックが頻繁に現れていることを意味します。

`root` のセルには、`create` の呼び出しの合計回数が表示されます。

## 謝辞

- [d3-flame-graph](https://github.com/spiermar/d3-flame-graph) を作成した [Martin Spier](https://github.com/spiermar) に感謝します

- [フレームグラフの実装](https://github.com/SamSaffron/flamegraph)を作成した [Sam Saffron](https://github.com/SamSaffron) に感謝します。
