# RuboCop のカスタム Cop

TestProf には、より高いパフォーマンスのテストを書くことを支援する [RuboCop](https://github.com/rubocop/rubocop) の Cop が付属しています。

これらを有効化するには、RuboCop の設定に `test-prof` を追加してください。

```yml
# .rubocop.yml
plugins:
 - 'test-prof'
```

もしくは、動的に指定することも可能です。

```sh
bundle exec rubocop --plugin 'test-prof' --only RSpec/AggregateExamples
```

> [!NOTE]
> プラグインの仕組みは RuboCop 1.72 以降でサポートされています。それより前のバージョンでは、`plugins` の代わりに `require` を使用してください。

Cop を自分のニーズに合わせて設定する場合は、以下のようにしてください。

```yml
RSpec/AggregateExamples:
  AddAggregateFailuresMetadata: false
```

## RSpec/AggregateExamples

この Cop は、最近の RSpec の強力な機能の一つである「失敗の集約（aggregate_failures）」を example の中で使用することを推奨します。

アサーションごとに example を書くのではなく、_独立した_ アサーションを一つの example にまとめることで、セットアップのフックを一度だけ実行するようにできます。
これにより、example の総数が減り、テストのパフォーマンスが劇的に向上することがあります。

以下の例を考えます。

```ruby
# bad
it { is_expected.to be_success }
it { is_expected.to have_header("X-TOTAL-PAGES", 10) }
it { is_expected.to have_header("X-NEXT-PAGE", 2) }
its(:status) { is_expected.to eq(200) }

# good
it "returns the second page", :aggregate_failures do
  is_expected.to be_success
  is_expected.to have_header("X-TOTAL-PAGES", 10)
  is_expected.to have_header("X-NEXT-PAGE", 2)
  expect(subject.status).to eq(200)
end
```

自動修正 (auto-correct) では、通常 example に `:aggregate_failures` を自動的に追加します。
しかし、プロジェクト全体でグローバルに有効にしている場合や、ファイルの場所からメタデータを導出するなどして選択的に有効にしている場合は、`AddAggregateFailuresMetadata` 設定オプションを使って、追加しないようにできます。

この Cop は自動修正をサポートしているため、古いテストを自動的にリファクタリングできます！

**注意**: ここで示した `its` の example は RSpec 3 以降では非推奨になっていますが、[rspec-its gem](https://github.com/rspec/rspec-its) を使用しているユーザーは、この Cop を活用してその依存をなくすことができます。

**注意**: `change` などのブロックマッチャーを使った example の自動修正は、意図的にサポートしていません。
