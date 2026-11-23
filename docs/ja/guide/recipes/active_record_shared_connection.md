# Active Record Shared Connection

> 💀  この機能は v1.0 で削除されました。

**注意:** 同様の機能が、バージョン 5.1 以降の Rails に追加されています ([PR](https://github.com/rails/rails/pull/28083) を参照)。最近の Rails では `ActiveRecordSharedConnection` を使うべきではありません。予期しない動作 (たとえば mutex のデッドロック) を引き起こすおそれがあります。

Active Record は、デフォルトではスレッドごとにコネクションを作成します。

そのため、(Capybara を使う) システムテストでは `transactional_tests` 機能を使えません (Capybara は Web サーバーを別のスレッドで実行するためです)。

よくある方法は、`database_cleaner` をトランザクションを使わないストラテジー (`truncation` / `deletion`) で使うことです。しかし、この _クリーニング_ のフェーズはテストの実行時間に影響することがあります (そして、たいていは影響します)。

スレッド間でコネクションを共有すれば、いつもどおりトランザクショナルテストを使えるようになります。

## 使い方

`spec_helper.rb` (あれば `rails_helper.rb`) に以下を追加してください。

```ruby
require "test_prof/recipes/active_record_shared_connection"
```

これにより、_shared connection_ モードが自動的に有効になります。

手動で有効・無効を切り替えることもできます。

```ruby
TestProf::ActiveRecordSharedConnection.enable!
TestProf::ActiveRecordSharedConnection.disable!
```
