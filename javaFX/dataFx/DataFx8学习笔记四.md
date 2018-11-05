## DataFx 8 学习笔记四

在本教程中，我将展示如何从流的外部管理流的操作处理和导航，这里我们需要对笔记三中的向导例子进行重构。

之前我们提到过，这个向导是由一些向导界面和一些包含功能按钮的工具栏组成：

![图一](./pic/pic7.png '图一')

导航模型连接了所有的向导视图，笔记三中是通过视图控制器类定义这些动作和导航的，这一章，我们使用 `DataFx` 提供的另一种方式。所有视图都不需要知道这些动作和导航的定义，这些动作被定义在外部。具体的导航和动作逻辑和笔记三中的一致：

![图二](./pic/pic5.png '图二')

首先，我们还是要从编写 FXML 文件开始，这里我们的 FXML 文件的编写和上个笔记中的是一致的。

如果你的 FXML 部分完成了，我们来看下一步：所有的向导视图文件都需要一个对象的控制器类，我们先建一个空的类：

	@FXMLController(value="wizard1.fxml", title = "Wizard: Step 1")
	public class Wizard1Controller {
	 
	}

因为所有的向导动作都是在工具栏中触发的，所以我们建一个包含所有向导动作的抽象类：

	public class AbstractWizardController {
	 
	    @FXML
	    @ActionTrigger("back")
	    private Button backButton;
	 
	    @FXML
	    @ActionTrigger("finish")
	    private Button finishButton;
	 
	    @FXML
	    @ActionTrigger("next")
	    private Button nextButton;
	 
	    public Button getBackButton() {
	        return backButton;
	    }
	 
	    public Button getFinishButton() {
	        return finishButton;
	    }
	 
	    public Button getNextButton() {
	        return nextButton;
	    }
	}

所有的视图控制器都可以继承这个类

	@FXMLController(value="wizard1.fxml", title = "Wizard: Step 1")
	public class Wizard1Controller extends AbstractWizardController {
	 
	}

基本结构和笔记三中的类似，但是有一个地方做了改变。之前 `next` 按钮不能定义在父类，因为 `@LinkAction` 注解必须指定目标导航界面作为参数。这次我们要把这个动作提出出来。所以所有的按钮我们都可以先定义在父类中。你可以看到，这次我们使用的是 `@ActionTrigger` 注解，这个注解的作用我们前面提到过，任何时候点击指定 ID 的按钮，都会触发定义了对应 ID 的动作。

最后，有还是一样的需要编写一个入口类，这个入口类可能和之前定义的不太一样，这里我们要定义所有视图界面的联系，及他们的动作。我们先类编写一个简单的类来展现这些界面：

	public class Tutorial4Main extends Application {
	 
	    public static void main(String[] args) {
	        launch(args);
	    }
	 
	    @Override
	    public void start(Stage primaryStage) throws Exception {
	        new Flow(WizardStartController.class).startInStage(primaryStage);
	    }
	}

下一步，我们需要绑定所有的不同的视图然后创建一个导航模型，为了达到这个目的， `Flow` 类提供了一些类定义流中视图的连接关系，通过这些方法可以很容易的将这些连接关系和动作添加到流中，下面是一个简单的例子：

	new Flow(View1Controller.class).
	withLink(View1Controller.class, "link-id", View2Controller.class).
	startInStage(primaryStage);

这就定义了一个流中连个视图的连接关系，双方的视图都由他们的控制器类指定，他们的连接由一个唯一的ID指定，如例子中的 `link-id` 。一旦这些连接关系建立了，你就可以在视图1的某个节点是添加 `@ActionTrigger('link-id')`注解， `DataFx` 会注册一个到视图二的导航在这个节点上，一点这个节点被点击，就能导航到视图2.

所以，我们的入口类代码需要改成如下所示:

	public class Tutorial4Main extends Application {
	 
	    public static void main(String[] args) {
	        launch(args);
	    }
	 
	    @Override
	    public void start(Stage primaryStage) throws Exception {
	        new Flow(WizardStartController.class).
	                withLink(WizardStartController.class, "next", Wizard1Controller.class).
	                withLink(Wizard1Controller.class, "next", Wizard2Controller.class).
	                withLink(Wizard2Controller.class, "next", Wizard3Controller.class).
	                withLink(Wizard3Controller.class, "next", WizardDoneController.class).
	                withGlobalBackAction("back").
	                withGlobalLink("finish", WizardDoneController.class).
	                startInStage(primaryStage);
	    }
	}

除了 `withLink()` 方法，代码里还用到了两个其他的方法，`withGlobalLink()` 方法定义了一个导航动作，这个动作会注册到流里的每个视图里。所以流里的所有视图里都可以使用 `@ActionTrigger('finish)` 注解来导航至指定的视图。每个动作类型都可以注册到一个 `DataFx` 流里。 `Flow`类可以给一个视图界面注册动作，或给所有视图注册一个全局动作。这对返回动作也是有效的，每个视图里都有 `back` 按钮，所以我们这里用到了 `withGlobalBackAction(“back”)` 方法，每次 `back` 对应ID 的动作触发都会导航到上一个界面，和之前使用的 `@BackAction()` 的效果是一样的。

这些方法都能向 `DataFx` 流里添加一个动作，动作是在接口 `org.datafx.controller.flow.action` 定义的，所有可见的方法都会内部调用 ` Flow.addActionToView(Class controllerClass, String actionId, FlowAction action)`
来添加指定ID的动作到特定的视图上。要添加全局动作的话需要调用 `Flow.addGlobalAction(String actionId, FlowAction action)`.正如你看到的，自定义的动作也能通过实现 `FlowAction` 接口添加到流中。 `DataFx` 包含了所有重要的动作集合可以添加到流中或特定的视图中。下图是 `FlowAction` 接口的继承关系：

![图三](./pic/pic8.bmp '图三')

下面简单介绍下几个基本的动作类型：

- `FlowLink` 定义一个连接到流中的另一个视图。在这个笔记的例子中，每当调用 `withLink(..)` 方法时，就会创建一个该类的实例
- `FlowBackAction` 处理流中的回退导航。这和在视图控制器中使用`@BackAction`注解是一样的
- `FlowAsyncTaskAction ` 执行任务的时候会定义一个 `Runnable` 线程在后台执行
- `FlowTaskAction ` 执行任务是作为一个 `Runnable` 在应用平台线程中执行。后面会举例子。
- `FlowMethodAction ` 在给定的视图中调用一个方法。和 `@ActionMethod` 注解的作用是一样的

之前用到的所有用注解定义的类都可以直接在流中定义，这样一个控制器类不需要知道一个动作是怎么实现的，只需要知道指定的 ID 和哪个节点会触发它。如果默认视图应该在多个流中使用，或者控制器类和/或操作类是不同模块的一部分，而这些模块之间并不相互依赖，那么这种结构将非常有用。下面看看他的结构图：

![图四](./pic/pic9.png '图四')

在下面的例子中，`ViewController1.class `, `ViewController2.class ` 和` CustomAction.class` 相互之间不知道对方的存在，我们可以通过 `DataFx` 流 API很容易的组合它们：

	new Flow(View1Controller.class).
	withLink(View1Controller.class, "link-id", View2Controller.class).
	withAction(View2Controller.class "callAction", new CustomAction()).
	startInStage(primaryStage);

最后我想扩展这个例子来打印一个帮助信息，这应该属于一个全局的动作，我们把这个动作注册到流中：

	new Flow(WizardStartController.class).
	withLink(WizardStartController.class, "next", Wizard1Controller.class).
	...
	withGlobalTaskAction("help", () -> System.out.println("## There is no help for the application <img src="http://i1.wp.com/www.guigarage.com/wordpress/wp-includes/images/smilies/frownie.png" alt=":(" class="wp-smiley" style="height: 1em; max-height: 1em;" width="12" height="12"> ##")).
	startInStage(primaryStage);

如您在代码中看到的，您可以简单地将lambda表达式作为动作传递给流，因为这里内部使用的FlowTaskAction类将操作定义为 `Runnable` 的，它是Java8以来的函数接口。之后，这个动作可以在任何地方被触发：

	@FXMLController(value="wizard1.fxml", title = "Wizard: Step 1")
	public class Wizard1Controller extends AbstractWizardController {
	 
	    @FXML
	    @ActionTrigger("help")
	    private Hyperlink helpLink;
	}

在查看本教程的源代码时，您将看到“帮助”操作并没有在所有视图中触发。这对DataFX来说不是问题。不能在每个视图中调用全局操作，甚至不能在定义的控制器中调用普通操作。API只定义有一个可以调用给定id的操作。对于最后这个步骤，一个超链接标记被添加到FXML文件中。下面是一个最终向导的一个截图：

![图5](./pic/pic10.png '图5')