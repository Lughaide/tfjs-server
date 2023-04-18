import java.awt.EventQueue;

import javax.swing.JFrame;
import java.awt.BorderLayout;
import javax.swing.JComboBox;
import javax.swing.JFileChooser;
import javax.swing.JButton;
import javax.swing.JPanel;
import javax.swing.JTextField;
import javax.swing.JTextArea;
import javax.swing.JSplitPane;
import javax.swing.JLayeredPane;
import javax.swing.JTabbedPane;
import javax.swing.JLabel;
import javax.swing.SwingConstants;
import java.awt.Font;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpRequest.BodyPublishers;
import java.net.http.HttpResponse.BodyHandlers;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;

import com.google.gson.*;

public class tempbuild {

	private JFrame frmNtWeb;
	private JTextField textField;

	/**
	 * Launch the application.
	 */
	public static void main(String[] args) {
		EventQueue.invokeLater(new Runnable() {
			public void run() {
				try {
					tempbuild window = new tempbuild();
					window.frmNtWeb.setVisible(true);
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		});
	}

	/**
	 * Create the application.
	 */
	public tempbuild() {
		initialize();
	}

	/**
	 * Initialize the contents of the frame.
	 */
	private void initialize() {
		frmNtWeb = new JFrame();
		frmNtWeb.setTitle("NT109 - Web Client");
		frmNtWeb.setBounds(100, 100, 450, 300);
		frmNtWeb.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
		frmNtWeb.getContentPane().setLayout(new BorderLayout(0, 0));
		
		JTabbedPane tabbedPane = new JTabbedPane(JTabbedPane.TOP);
		frmNtWeb.getContentPane().add(tabbedPane, BorderLayout.CENTER);
		
		JPanel panel = new JPanel();
		tabbedPane.addTab("Figlet", null, panel, null);
		panel.setLayout(new BorderLayout(0, 0));
		
		JLabel lblNewLabel = new JLabel("Figlet");
		lblNewLabel.setHorizontalAlignment(SwingConstants.CENTER);
		lblNewLabel.setFont(new Font("Tahoma", Font.PLAIN, 14));
		panel.add(lblNewLabel, BorderLayout.NORTH);
		
		textField = new JTextField();
		panel.add(textField, BorderLayout.WEST);
		textField.setColumns(10);
		
		JTextArea textArea = new JTextArea();
		textArea.setTabSize(16);
		textArea.setLineWrap(true);
		textArea.setEnabled(false);
		panel.add(textArea, BorderLayout.CENTER);
		
		JPanel panel_1 = new JPanel();
		tabbedPane.addTab("Predict", null, panel_1, null);
		panel_1.setLayout(new BorderLayout(0, 0));
		
		JLabel lblNewLabel_1 = new JLabel("MobileNet Prediction");
		lblNewLabel_1.setFont(new Font("Tahoma", Font.PLAIN, 14));
		lblNewLabel_1.setHorizontalAlignment(SwingConstants.CENTER);
		panel_1.add(lblNewLabel_1, BorderLayout.NORTH);
		
		JTextArea textArea_1 = new JTextArea();
		textArea_1.setLineWrap(true);
		textArea_1.setEnabled(false);
		panel_1.add(textArea_1, BorderLayout.CENTER);
		
		JButton btnNewButton_1 = new JButton("Predict");
		panel_1.add(btnNewButton_1, BorderLayout.SOUTH);
		btnNewButton_1.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent e) {
				var message = """
						{"image":
						"""; 
				URI uri = null;
				try {
					uri = new URI("http://localhost:8080/predict");
				} catch (URISyntaxException e1) {
					// TODO Auto-generated catch block
					e1.printStackTrace();
				}
				JFileChooser fc = new JFileChooser();
				int returnVal = fc.showOpenDialog(null);
				if (returnVal == JFileChooser.APPROVE_OPTION) {
					File file = fc.getSelectedFile();
					byte[] data;
					try {
						data = Files.readAllBytes(file.toPath());
						var temp = Base64.getEncoder().encodeToString(data);
						message = message +  "\"" + temp + "\"" + "}";
						Gson gson = new Gson();
						JsonObject res = gson.fromJson(executeRequest(uri, message), JsonObject.class);
						JsonArray ans = res.get("reply").getAsJsonArray();
						ans.forEach((element) -> {
							textArea_1.append(element + "\n");
							System.out.println(element.toString());
						});
					} catch (IOException e1) {
						// TODO Auto-generated catch block
						e1.printStackTrace();
					} catch (JsonSyntaxException e1) {
						// TODO Auto-generated catch block
						e1.printStackTrace();
					} catch (InterruptedException e1) {
						// TODO Auto-generated catch block
						e1.printStackTrace();
					}
				}
			}
		});

		JButton btnNewButton = new JButton("Submit");
		btnNewButton.addActionListener(new ActionListener() {

			@Override
			public void actionPerformed(ActionEvent e) {
				// TODO Auto-generated method stub
				String text = textField.getText();
				var message = """
						{"text":
						""";
				message = message +  "\"" + text + "\"" + "}"; 
				URI uri = null;
				try {
					uri = new URI("http://localhost:8080/figlet");
				} catch (URISyntaxException e1) {
					// TODO Auto-generated catch block
					e1.printStackTrace();
				}
				try {
					Gson gson = new Gson();
					JsonObject res = gson.fromJson(executeRequest(uri, message), JsonObject.class);
					var ans = res.get("reply").getAsString();
					textArea.setText(ans);
					System.out.println(ans);
				} catch (IOException e1) {
					// TODO Auto-generated catch block
					e1.printStackTrace();
				} catch (InterruptedException e1) {
					// TODO Auto-generated catch block
					e1.printStackTrace();
				}
			}
		});
		panel.add(btnNewButton, BorderLayout.SOUTH);
	}
	
	static String executeRequest(URI uri, String message) throws IOException, InterruptedException {
		var client = HttpClient.newHttpClient();
		var request = HttpRequest.newBuilder(uri).POST(BodyPublishers.ofString(message))
				.header("Content-Type", "application/json").build();
		
		var response = client.send(request, BodyHandlers.ofString());
		
		var bodyRes = response.body();
		return bodyRes;		
	}
}
