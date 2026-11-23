# RSpecStamp

RSpecStamp は、失敗した example に独自のタグを自動的に _付ける_ ツールです。

example に _文字どおり_ タグを追加します (つまり、example を書き換えます)。

RSpecStamp の主な目的は、テストコードベースのリファクタリングを簡単にすることです。グローバルな設定を変更すると、大量の失敗が発生することがあります。失敗する spec には、shared context を追加することで手当てできます。そこで RSpecStamp の出番です。

## ユースケースの例: Sidekiq Inline

`Sidekiq.testing!(:inline)` を使うことは、パフォーマンスへの悪影響があるため、_バッドプラクティス_ と見なされることがあります ([こちら](https://github.com/mperham/sidekiq/issues/3495)を参照)。それでも、いまだに広く使われています。

`inline!` から `fake!` へ移行するにはどうすればよいでしょうか？

ステップ 0. すべてのテストが通ることを確認します。

ステップ 1. 条件付きで `inline!` モードを有効にする shared context を作成します。

```ruby
shared_context "sidekiq:inline", sidekiq: :inline do
  around(:each) { |ex| Sidekiq::Testing.inline!(&ex) }
end
```

ステップ 2. `fake!` モードをグローバルに有効にします。

ステップ 3. `RSTAMP=sidekiq:inline rspec` を実行します。

上のコマンドの出力には、_スタンプ_ の処理についての情報が含まれます。

- いくつのファイルが影響を受けたか？

- いくつのパッチが作られたか？

- いくつのパッチが失敗したか？

- いくつのファイルが無視されたか？

これで、失敗する spec のすべて (あるいはほぼすべて) に `sidekiq: :inline` のタグが付きました。スイート全体をもう一度実行し、失敗が残っていないか確認してください。

`dry-run` モード (環境変数 `RSTAMP_DRY_RUN=1` で有効になります) もあり、ファイルを書き換える代わりにパッチを出力します。

## 設定

デフォルトでは、RSpecStamp は `spec/support` ディレクトリ (shared example を置く典型的な場所) にある example を無視します。
_無視する_ パターンを追加することもできます。

```ruby
TestProf::RSpecStamp.configure do |config|
  config.ignore_files << %r{spec/my_directory}
end
```
