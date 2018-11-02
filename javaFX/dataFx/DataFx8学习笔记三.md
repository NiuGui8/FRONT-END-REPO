## DataFx 8 学习笔记三

在这个笔记中，我们将学习如何使用 `DataFx` 制作一个向导对话框 , 这个向导中将包含五个不同的相互关联的视图：

![图一](/pic/pic4.png '图一')

除了下一步操作之外，还需要提供上一步操作和完成操作：

![图二](/pic/pic5.png '图二')

注意：最后一个对话框不会包含所有可能的连接。因为返回操作永远是返回上一个视图，比如你在首页直接点完成导航至最后一页，在最后一页点返回就会立即回到首页。

和前面的例子一样，我们需要先编写 FXML 文件，所有的向导界面都包含一个工具栏（包含一些按钮定义了一些动作），下面是预览图：

![图三](/pic/pic6.png '预览图')


我们不需要每个视图都实现这个工具栏，FXML 提供了 ` fx:include` 标签用来引入其他使用 fxml定义的视图。 所以我们可以将工具栏第一为一个单独的 FXML 文件：

	<?xml version="1.0" encoding="UTF-8"?>
	 
	<?import java.lang.*?>
	<?import java.util.*?>
	<?import javafx.geometry.*?>
	<?import javafx.scene.control.*?>
	<?import javafx.scene.layout.*?>
	<?import javafx.scene.paint.*?>
	 
	<HBox alignment="CENTER_RIGHT" maxHeight="-Infinity" maxWidth="1.7976931348623157E308" minHeight="-Infinity" minWidth="-Infinity" prefHeight="-1.0" prefWidth="-1.0" spacing="12.0" style="-fx-background-color: darkgray;" xmlns="http://javafx.com/javafx/8" xmlns:fx="http://javafx.com/fxml/1">
	<children>
	  <Button fx:id="backButton" mnemonicParsing="false" text="Back" />
	  <Button fx:id="nextButton" mnemonicParsing="false" text="Next" />
	  <Button fx:id="finishButton" mnemonicParsing="false" text="Finish" />
	</children>
	<padding>
	  <Insets bottom="12.0" left="12.0" right="12.0" top="12.0" />
	</padding>
	</HBox>

正如你所看到的，工具栏定义了三个按钮分别定义了动作 “back”, “next” 和 “finish” 。在之前的学习笔记中提到过，可以在控制器字段名称匹配 FXML 中`fx:id`属性的字段上添加 `@FXML` 注解的方式注入这些组件。

现在，定义工具栏的 FXML 文件可以引入到其他 FXML文件中：

	<?xml version="1.0" encoding="UTF-8"?>
	 
	<?import javafx.geometry.Insets?>
	<?import javafx.scene.control.Label?>
	<?import javafx.scene.layout.BorderPane?>
	<?import javafx.scene.layout.StackPane?>
	<?import javafx.scene.text.Font?>
	 
	<BorderPane prefHeight="240.0" prefWidth="400.0" xmlns="http://javafx.com/javafx/8" xmlns:fx="http://javafx.com/fxml/1">
	    <bottom>
	        <fx:include source="actionBar.fxml"/>
	    </bottom>
	    <center>
	        <StackPane maxHeight="1.7976931348623157E308" maxWidth="1.7976931348623157E308" BorderPane.alignment="CENTER">
	            <children>
	                <Label text="This is the first step.">
	                    <StackPane.margin>
	                        <Insets bottom="32.0" left="32.0" right="32.0" top="32.0"/>
	                    </StackPane.margin>
	                    <font>
	                        <Font size="24.0"/>
	                    </font>
	                </Label>
	            </children>
	        </StackPane>
	    </center>
	</BorderPane>

正如你看到的，工具栏被整合到了视图中 `BorderPane` 组件的底部
如果你建好了所有的FXML文件 ， 我们就可以开始给每一个视图创建相应的控制器类了：

	@FXMLController(value="wizard1.fxml", title = "Wizard: Step 1")
	public class Wizard1Controller {
	 
	}

下一步，我们需要将工具栏里的这些按钮注入到控制器中，并为他们定义指定的动作。这里我们要介绍一个新的注解：`@BackAction` ,这个注解的作用是，返回上一个视图，下面是一个孔子器的例子：

	@FXMLController(value="wizard1.fxml", title = "Wizard: Step 1")
	public class Wizard1Controller {
	 
	    @FXML
	    @LinkAction(Wizard2Controller.class)
	    private Button nextButton;
	 
	    @FXML
	    @BackAction
	    private Button backButton;
	 
	    @FXML
	    @LinkAction(WizardDoneController.class)
	    private Button finishButton;
	 
	}

如果我们所有的控制器都这样写的话，就会有许多重复的代码 ， 这里我们定义一个抽象列，所有的控制器都依赖这个抽象类：

	public class AbstractWizardController {
	 
	    @FXML
	    @BackAction
	    private Button backButton;
	 
	    @FXML
	    @LinkAction(WizardDoneController.class)
	    private Button finishButton;
	 
	    public Button getBackButton() {
	        return backButton;
	    }
	 
	    public Button getFinishButton() {
	        return finishButton;
	    }
	}

下面是重新编写后的控制器类：

	@FXMLController(value="wizard1.fxml", title = "Wizard: Step 1")
	public class Wizard1Controller extends AbstractWizardController {
	 
	    @FXML
	    @LinkAction(Wizard2Controller.class)
	    private Button nextButton;
	}

注意：在父类注入一个私有的节点是 `DataFx` 的一个特性 ， 如果你使用默认的 `FXMLLoader` 加载，这些是无效的。此外， `FXMLLoader` 也不支持注入父类 FXML 定义的通过 `分析：id` 包含的节点。作为限制，这个节点不能定义CSS id，因为这会覆盖java对象中的fx:id，在这种情况下，DataFX不能注入它们。

最后一步，我们需要将第一个视图中的 `back` 和最后一个视图`finis`设为不可点击，我们可以通过 `@PostConstruct` 注解的方法来实现：

	@FXMLController(value="wizardDone.fxml", title = "Wizard: Finish")
	public class WizardDoneController extends AbstractWizardController {
	 
	    @FXML
	    private Button nextButton;
	 
	    @PostConstruct
	    public void init() {
	        nextButton.setDisable(true);
	        getFinishButton().setDisable(true);
	    }
	}

到这里，这个向导就完成了 ， 最后我们需要一个启动类：

	public class Tutorial3Main extends Application {
	 
	    public static void main(String[] args) {
	        launch(args);
	    }
	 
	    @Override
	    public void start(Stage primaryStage) throws Exception {
	        new Flow(WizardStartController.class).startInStage(primaryStage);
	    }
	}