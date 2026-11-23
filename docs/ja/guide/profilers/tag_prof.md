# TagProf

TagProf は、指定されたタグの値ごとに example の統計情報をまとめて収集するシンプルなプロファイラです。

これは、`rspec-rails` の組み込み機能である `infer_spec_type_from_file_location!` (example のメタデータに自動的に `type` を追加する機能) と組み合わせるととても便利です。

出力例:

```sh
[TEST PROF INFO] TagProf report for type

       type          time   total  %total   %time           avg

    request     00:04.808      42   33.87   54.70     00:00.114
 controller     00:02.855      42   33.87   32.48     00:00.067
      model     00:01.127      40   32.26   12.82     00:00.028
```

各グループの example の総数と、費やされた合計時間の両方が表示されます (割合と平均値も表示されます)。

インタラクティブな HTML レポートを生成することもできます:

```sh
TAG_PROF=type TAG_PROF_FORMAT=html bundle exec rspec
```

レポートは次のように表示されます:

<img alt="TagProf UI" data-origin="/assets/tag-prof.gif" src="/assets/tag-prof.gif">

## 使い方

TagProf は RSpec と Minitest の両方で使用できます (Minitest は限定的なサポートです。下記を参照してください)。

TagProf を有効にするには、環境変数 `TAG_PROF` を使用します:

RSpec の場合:

```sh
# type でグループ化する
TAG_PROF=type rspec
```

Minitest の場合\*:

```sh
# 素の ruby を使う場合
TAG_PROF=type ruby

# Rails の組み込みタスクを使う場合
TAG_PROF=type bin/rails test
```

注: 環境変数 TAG_PROF に "type" 以外の値を指定した場合、Minitest と RSpec のどちらでも、何も表示されずに無視されます。

\* Minitest 6 以降では、まずテストヘルパーに `Minitest.load :test_prof` を追加して、TestProf プラグインを有効にする必要があります。

### Minitest での使い方の違い

Minitest はデフォルトではタグの使用をサポートしていません。そのため TagProf は、テストのルートディレクトリ直下のサブディレクトリごとに統計情報をグループ化します。テストのルートディレクトリの名前は `spec` か `test` のいずれかであることを前提としています。

テストのルートディレクトリが見つからない場合、そのテストの統計情報は他のテストとグループ化されません。その場合、レポートに目立つ警告メッセージが出たうえで、テストごとに表示されます。

例:

```sh
[TEST PROF INFO] TagProf report for type

       type          time   sql.active_record  total  %total   %time           avg

__unknown__     00:04.808           00:01.402     42   33.87   54.70     00:00.114
 controller     00:02.855           00:00.921     42   33.87   32.48     00:00.067
      model     00:01.127           00:00.446     40   32.26   12.82     00:00.028
```

## イベントのプロファイリング

TagProf を [EventProf](./event_prof.md) と組み合わせると、費やされた合計時間だけでなく、(イベントを通じて) 指定したアクティビティに費やされた時間も追跡できます:

```
TAG_PROF=type TAG_PROF_EVENT=sql.active_record rspec
```

出力例:

```sh
[TEST PROF INFO] TagProf report for type

       type          time   sql.active_record  total  %total   %time           avg

    request     00:04.808           00:01.402     42   33.87   54.70     00:00.114
 controller     00:02.855           00:00.921     42   33.87   32.48     00:00.067
      model     00:01.127           00:00.446     40   32.26   12.82     00:00.028
```

複数のイベントにも対応しています (カンマ区切りで指定します)。

## 上級者向けのヒント: type を増やす

デフォルトでは、RSpec は Rails アプリケーションの標準的な構成要素 (コントローラ、モデル、メーラーなど) についてのみ type を推測します。
最近の Rails アプリケーションには、たいていそれ以外の抽象化 (サービス、フォーム、プレゼンターなど) も含まれていますが、RSpec はそれらを認識せず、メタデータを追加しません。

手軽な回避策は次のとおりです:

```ruby
RSpec.configure do |config|
  # ...
  config.define_derived_metadata(file_path: %r{/spec/}) do |metadata|
    # type がすでに設定されている場合は上書きしない
    next if metadata.key?(:type)

    match = metadata[:location].match(%r{/spec/([^/]+)/})
    metadata[:type] = match[1].singularize.to_sym
  end
end
```
