##  DataFx 8 笔记 （一）

`@ActionTrigger` 添加在控制器中用来定义视图节点的字段上，`DataFx` 容器会自动将动作添加到节点上。任何需要在动作触发的时候调用的方法都需要添加 `@ActionMethod` 注解。两个注解都需要指定一个对应动作的唯一 `ID` ,如下面例子中的 `"myAction"`:

	public class SimpleController {
	 
	    @FXML
	    private Label resultLabel;
	 
	    @FXML
	    @ActionTrigger("myAction")
	    private Button actionButton;
	 
	    @ActionMethod("myAction")
	    public void onAction() {
	        // DO some action...
	    }
	}


所以，不管任何时候点击 `actionButton` 按钮 ， `onAction` 方法都会被调用， 因为他们指定了同一个ID，这个 ID 在视图控制器里必须是唯一的 。 除了简单的调用一个方法外，后面会提到还有其他类型的动作。现在我们要关注的是 ， 添加了 `@ActionTrigger ` 事件的组件能触发指定了同一个 ID 的添加了 `@ActionMethod ` 注解的方法。

下一步，我们来实现这个动作然后定义一个带有默认的文本 `label`：

	public class SimpleController {
	 
	    @FXML
	    private Label resultLabel;
	 
	    @FXML
	    @ActionTrigger("myAction")
	    private Button actionButton;
	 
	    private int clickCount = 0;
	 
	    @PostConstruct
	    public void init() {
	        resultLabel.setText("Button was clicked " + clickCount + " times");
	    }
	 
	    @ActionMethod("myAction")
	    public void onAction() {
	        clickCount++;
	        resultLabel.setText("Button was clicked " + clickCount + " times");
	    }
	}

这里你可以看到新增了一个 `init()` 方法 ， 这个方法会在控制器初始化后并且所有标有 `@FXML` 注解的字段都注入完成后执行。 当然这个约束条件，需要在该方法上添加 `@PostConstruct ` 注解。 这里三种可以被注入的类型：

- 添加了 `@FXML` 注解的UI组件
- `DataFx` 对象 . 这里 `DataFx` 提供了几个注解
- 自定义实现 . 将通过 `@Inject` 注入

<text style="color:red;">被标注了 `@PostContruct` 将会在所有注入完成后调用</text>

目前还没有提到，如何绑定控制器和视图文件 FXML,  `DataFx` 提供了 `@FXMLController` 注解来达到这个目的。 通过使用这个注解，控制器类定义了包含视图布局的FXML文件。添加上注释后的代码如下所示：

	@FXMLController("simpleView.fxml")
	public class SimpleController {
	 
	    @FXML
	    private Label resultLabel;
	 
	    @FXML
	    @ActionTrigger("myAction")
	    private Button actionButton;
	 
	    private int clickCount = 0;
	 
	    @PostConstruct
	    public void init() {
	        resultLabel.setText("Button was clicked " + clickCount + " times");
	    }
	 
	    @ActionMethod("myAction")
	    public void onAction() {
	        clickCount++;
	        resultLabel.setText("Button was clicked " + clickCount + " times");
	    }
	}


这些都完成之后，我们需要一个入口类来启动我们的程序以及在屏幕上展示我们的视图。 我们不能使用基础的 `FXMLLoader` 类，因为我们用的一些注解只能通过 `DataFx` 容器来处理。 下面是一个可以启动项目的一个完整的 `main` 函数：

	public class Tutorial1Main extends Application {
	 
	    public static void main(String[] args) {
	        launch(args);
	    }
	 
	    @Override
	    public void start(Stage primaryStage) throws Exception {
	        new Flow(SimpleController.class).startInStage(primaryStage);
	    }
	}


这里展示了一种最简单的方式来开始一个流： 在开始一个视图的时候，控制器类往往作为一个参数传入 `Flow` 类中， 因为这个例子中我们只有一个视图，所以我们只要传入 `SimpleController ` 这一个类到 `Flow` 中。 `Flow` 提供了一个便利的方法 `startInStage()` , 通过这个方法可以将流渲染至`Stage` 中， `Scene` 会被自动创建，之后 `Stage` 会包含一个场景 ， 场景中只包含定义的流 ，上面的例子中，流只包含了一个视图。


第一个示例非常简单，通常只需在init()方法中使用一行Java代码就可以定义动作绑定:

	actionButton.setOnAction((e) -> onAction());

但是为什么我们这里所有的地方都用的是注解 ？ 在后面的指南中，你会看到，实际应用中复杂的多，为了代码可读性，我们推荐使用注解。