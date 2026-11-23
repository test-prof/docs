# テストのサンプリング

ランダムに選んだテストに対してプロファイラを実行すると役に立つことがあります。残念ながら、テストフレームワークはそのような機能をサポートしていません。そこで、RSpec と Minitest のための小さなパッチを TestProf に含めました。

## 使い方

対応するパッチを require してください。

```ruby
# RSpec の場合は spec_helper.rb に
require "test_prof/recipes/rspec/sample"

# Minitest の場合は test_helper.rb に
require "test_prof/recipes/minitest/sample"
```

そして、実行したい example の数を環境変数 `SAMPLE` に指定するだけです。

```sh
SAMPLE=10 rspec
```

`SAMPLE_GROUPS` 変数を使って、example group (またはスイート) をランダムに選んで実行することもできます。

```sh
SAMPLE_GROUPS=10 rspec
```

テストのサンプリングは、RSpec のフィルタと一緒に使えることも覚えておいてください。

```sh
SAMPLE=10 rspec --tag=api
SAMPLE_GROUPS=10 rspec -e api
```

これだけです。お楽しみください！
